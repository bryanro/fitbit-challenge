define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'flot',
    'flottime',
    'flottooltip',
    'flotorderbars',
    'tablesorter',
    'collections/activitylogs.collection',
    'collections/teams.collection',
    'text!./stats.html',
    'text!./stats-table.html',
    'text!./team-rank-table.html',
    'text!./individual-leaderboard-table.html'
], function ($, _, Backbone, moment, Flot, FlotTime, FlotTooltip, FlotOrderBars, TableSorter, ActivityLogCollection, TeamCollection, StatsTemplate, StatsTableTemplate, TeamRankTableTemplate, IndividualLeaderboardTableTemplate) {

    var UserView = Backbone.View.extend({

        el: $('#main-container'),

        initialize: function (options) {
            var that = this;
            this.activityLogCollection = new ActivityLogCollection();
            this.teamCollection = new TeamCollection();
            this.teamCollection.fetch({
                success: function (model, result, options) {
                    that.activityLogCollection.fetch({
                        success: function (model, result, options) {
                            that.createIndividualStatsGraph();
                            that.createTeamRankingGraph();
                            that.createTeamProgressionGraph();
                            that.createIndividualStatsTable();
                            that.createDailyLeaderboardTable();
                        },
                        error: function (model, xhr, options) {
                        }
                    });
                },
                error: function (model, result, options) {

                }
            });
        },

        render: function () {
            var that = this;
            this.statsTemplate= _.template(StatsTemplate);

            this.$el.html(this.statsTemplate({

            }));
        },

        events: {
        },

        createDailyLeaderboardTable: function () {
            var that = this;
            var data = [];
            _.each(this.activityLogCollection.models, function (activityLogItem) {
                var activityData = activityLogItem.get('activityData');
                data.push({ displayName: activityLogItem.get('user').displayName, steps: activityData[activityData.length - 1].steps });
            });

            this.individualLeaderboardTableTemplate = _.template(IndividualLeaderboardTableTemplate);
            $('#individual-leaderboard').html(this.individualLeaderboardTableTemplate({
                data: data
            }));

            $('#individual-leaderboard-table').tablesorter({
                sortList: [[1,1]],
                sortInitialOrder: 'desc',
                textExtraction: function(node) {
                    // extract data from markup and return it
                    // need this workaround because tablesorter not handling the commas of numbers properly (e.g. 1,000)
                    var cellText = node.innerHTML;
                    if (cellText.length > 3) {
                        // if cell length is more than 3 characters, check if the last 3 characters are a number
                        //  if not a number return the cellText unmodified
                        //  if a number return the cellText without any commas
                        var cellTextLast3Char = cellText.substring(cellText.length - 3);
                        return isNaN(cellText.substring(cellText.length - 3)) ? cellText : cellText.replace(/[^\d\.\-\ ]/g, '');
                    }
                    else {
                        return cellText
                    }
                }
            });
        },

        createIndividualStatsTable: function () {
            var that = this;
            var dates = [];
            if (this.activityLogCollection.models && this.activityLogCollection.models.length > 0) {
                var activityData = this.activityLogCollection.at(0).get('activityData');
                _.each(activityData, function (activityDataItem) {
                    dates.push(new Date(activityDataItem.date));
                });
            }

            var $dailyStats = $('#daily-stats');
            this.statsTableTemplate = _.template(StatsTableTemplate);
            $dailyStats.html(this.statsTableTemplate({
                activityLogCollection: that.activityLogCollection,
                dates: dates
            }));

            $('#daily-stats-table').tablesorter({
                sortList: [[that.activityLogCollection.at(0).get('activityData').length,1]],
                sortInitialOrder: 'desc',
                textExtraction: function(node) {
                    // extract data from markup and return it
                    // need this workaround because tablesorter not handling the commas of numbers properly (e.g. 1,000)
                    var cellText = node.innerHTML;
                    if (cellText.length > 3) {
                        // if cell length is more than 3 characters, check if the last 3 characters are a number
                        //  if not a number return the cellText unmodified
                        //  if a number return the cellText without any commas
                        var cellTextLast3Char = cellText.substring(cellText.length - 3);
                        return isNaN(cellText.substring(cellText.length - 3)) ? cellText : cellText.replace(/[^\d\.\-\ ]/g, '');
                    }
                    else {
                        return cellText
                    }
                }
            });
        },

        createTeamStatsTable: function (data) {
            var that = this;
            var $teamStats = $('#team-rank');

            var leaderStepCount = 0;
            _.each(data, function (dataItem) {
                var steps = dataItem.data[0][1];
                if (leaderStepCount < steps) {
                    leaderStepCount = steps;
                }
            });

            this.teamRankTableTemplate = _.template(TeamRankTableTemplate);
            $teamStats.html(this.teamRankTableTemplate({
                data: data,
                leaderStepCount: leaderStepCount
            }));

            // set table to be a sortable table and sort by second column (number of steps) descending
            $('#team-rank-table').tablesorter({
                sortList: [[1,1]]
            });
        },

        createTeamRankingGraph: function () {
            var that = this;
            var data = [];

            // team 1: bryan, mehalso, cooper
            // team 2: ronemous, rick, shanavia
            // team 3: andres, gino, alan
            var teams = this.teamCollection;

            _.each(teams.models, function (team) {
                var teamTotalStepCount = 0;
                _.each(team.get('teamMembers'), function (teamMemberUsername) {
                    var teamMember = that.activityLogCollection.filter(function (activityLogItem){
                        return activityLogItem.get('user').username == teamMemberUsername;
                    });
                    if (teamMember.length == 1) {
                        teamTotalStepCount += _.reduce(teamMember[0].get('activityData'), function (memo, activityItem) {
                            return memo + activityItem.steps;
                        }, 0);
                    }
                    else {
                        console.log('Could not find team member: ' + teamMemberUsername);
                    }
                });
                data.push({label: team.get('teamName'), data: [[1, teamTotalStepCount]], bars: { order: team.get('teamNum') }});
            });
            //console.log('Team ranking data for graphing: ' + JSON.stringify(data));
            $.plot($("#team-ranking"), data,
                {
                    series: {
                        bars: {
                            show: true
                        }
                    },
                    xaxis: {
                        autoscaleMargin: 0.1,
                        show: false
                    },
                    yaxis: {
                    },
                    grid: {
                        hoverable: true
                    },
                    tooltip: true,
                    tooltipOpts: {
                        content: "%s: %y steps"
                    }
                }
            );

            this.createTeamStatsTable(data);
        },

        createTeamProgressionGraph: function () {
            var that = this;
            var data = [];

            var teams = this.teamCollection;

            var activityLogsAgg = [];
            // iterate through the activity log collection and progressively add the data into the activityLogAgg collection
            /* example (note: different structure, just illustrating the point:
                original:   [{ day 1: 9000 steps },  { day 2: 8000 steps}, { day 3: 10000 steps }]
                output:     [{ day 1: 9000 steps },  { day 2: 17000 steps}, { day 3: 27000 steps }]
             */
            that.activityLogCollection.each(function (activityLogItem) {
                var activityData = [];
                var activityLogItemAgg = { username: activityLogItem.get('user').username, activityData: []};
                _.reduce(activityLogItem.get('activityData'), function (memo, activityItem) {
                    activityLogItemAgg.activityData.push({ date: activityItem.date, dateGetTime: (new Date(activityItem.date)).getTime(), steps: memo + activityItem.steps });
                    //activityData.push([(new Date(activityItem.date)).getTime(), memo + activityItem.steps]);
                    return memo + activityItem.steps;
                }, 0);
                activityLogsAgg.push(activityLogItemAgg);
                // TODO: CHANGE TO DISPLAYNAME IF NOT USING IN LATER ARRAY TO CONSOLIDATE TO TEAM
                //data.push({label: activityLogItem.get('user').username, data: activityData})
            });

            // create a new teamData array that consolidates all of the progressive data for each person on the team
            var teamData = [];
            _.each(teams.models, function (team) {
                var teamMembersAgg = activityLogsAgg.filter(function (dataItem){
                    return _.contains(team.get('teamMembers'), dataItem.username);
                });
                if (teamMembersAgg.length > 0) {
                    var teamActivityData = [];
                    var startDate = new Date(teamMembersAgg[0].activityData[0].date);
                    var today = new Date();
                    for (var dateIterator = startDate; dateIterator <= today; dateIterator.setDate(dateIterator.getDate() + 1)) {
                        var dateStepCount = 0;
                        _.each(teamMembersAgg, function (teamMemberData) {
                            var activityDataForDate = _.findWhere(teamMemberData.activityData, { dateGetTime: dateIterator.getTime()});
                            if (activityDataForDate && activityDataForDate.steps) {
                                dateStepCount += activityDataForDate.steps;
                                //console.log('Adding ' + activityDataForDate.steps + ' to total count, equaling: ' + dateStepCount);
                            }
                        });
                        if (!(dateStepCount === 0 && dateIterator.getDate() > today.getDate() - 1)) {
                            teamActivityData.push({date: dateIterator, dateTime: dateIterator.getTime(), steps: dateStepCount});
                        }
                    }
                    teamData.push({ team: team, activityData: teamActivityData })
                }
                else {
                    console.log('No data for members of team: ' + team.get('teamName'));
                }
            });

            // convert team data to graph-able data
            var data = [];
            _.each(teamData, function (teamDataIterator) {
                var graphData = [];
                _.each(teamDataIterator.activityData, function (dataPoint) {
                    graphData.push([dataPoint.dateTime, dataPoint.steps]);
                });
                data.push({ label: teamDataIterator.team.get('teamName'), data: graphData });
            });

            //console.log('Data to graph for createTeamProgressionGraph: ' + JSON.stringify(data));

            var plotOptions = {
                xaxis: {
                    mode: 'time',
                    timeformat: '%m/%d',
                    minTickSize: [1, 'day']
                },
                yaxis: {
                    min: 0
                },
                grid: {
                    hoverable: true
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s: %y steps"
                },
                legend: {
                    position: "nw"
                }
            };
            $.plot($("#team-stats"), data, plotOptions);
        },

        createIndividualStatsGraph: function () {
            var that = this;
            var data = [];
            var autoColorIterator = 0;
            var color;
            this.activityLogCollection.each(function (activityLogModel) {
                var itemData = [];
                _.each(activityLogModel.get('activityData'), function (activityLogItem) {
                    var itemArray = [(new Date(activityLogItem.date)).getTime(), activityLogItem.steps];
                    itemData.push(itemArray);
                });
                color = activityLogModel.get('user').userGraphColor || autoColorIterator++;
                data.push({ label: activityLogModel.get('user').displayName, data: itemData, color: color});
            });
            //console.log('Graph data for individual stats: ' + JSON.stringify(data));
            var plotOptions = {
                xaxis: {
                    mode: 'time',
                    timeformat: '%m/%d',
                    minTickSize: [1, 'day']
                },
                yaxis: {
                    min: 0
                },
                grid: {
                    hoverable: true
                },
                tooltip: true,
                tooltipOpts: {
                    content: "%s: %y steps"
                },
                legend: {
                    position: "nw",
                    sorted: 'ascending',
                    container: '#individual-stats-legend'
                }
            };
            $.plot($("#individual-stats"), data, plotOptions);
        }
    });

    return UserView;
});