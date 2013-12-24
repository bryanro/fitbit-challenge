define([
    'jquery',
    'underscore',
    'backbone',
    'flot',
    'flottime',
    'flotlabels',
    'collections/activitylogs.collection',
    'text!./stats.html'
], function ($, _, Backbone, Flot, FlotTime, FlotLables, ActivityLogCollection, StatsTemplate) {

    var UserView = Backbone.View.extend({

        el: $('#main-container'),

        initialize: function (options) {
            var that = this;
            this.activityLogCollection = new ActivityLogCollection();
            this.activityLogCollection.fetch({
                success: function (model, result, options) {
                    that.createIndividualStatsGraph();
                    that.createTeamRankingGraph();
                },
                error: function (model, xhr, options) {
                }
            });
        },

        render: function () {
            this.statsTemplate= _.template(StatsTemplate);
            this.$el.html(this.statsTemplate({

            }));
        },

        events: {
        },

        createTeamRankingGraph: function () {
            var that = this;
            var data = [];

            // team 1: bryan, mehalso, cooper
            // team 2: ronemous, rick, shanavia
            // team 3: andres, gino, alan
            var teams = [
                {
                    teamNum: 1,
                    teamMembers: ['28HN4N', '28CDDV', '28DV9Z']
                },
                {
                    teamNum: 2,
                    teamMembers: ['28NRB3', '28HFJZ', '27Y8LZ']
                },
                {
                    teamNum: 3,
                    teamMembers: ['28CPPB', '28HRL8', '28BSSF']
                }
            ];

            _.each(teams, function (team) {
                var teamNum = team.teamNum;
                var teamTotalStepCount = 0;
                _.each(team.teamMembers, function (teamMemberUsername) {
                    var teamMember = that.activityLogCollection.filter(function (activityLogItem){
                        return activityLogItem.get('user').username == teamMemberUsername;
                    });
                    if (teamMember.length == 1) {
                        console.log('Found team member: ' + teamMemberUsername);
                        teamTotalStepCount += _.reduce(teamMember[0].get('activityData'), function (memo, activityItem) {
                            return memo + activityItem.steps;
                        }, 0);
                    }
                    else {
                        console.log('Could not find team member: ' + teamMemberUsername);
                    }
                });
                data.push([teamNum, teamTotalStepCount]);
            });
            console.log('DATA: ' + JSON.stringify(data));
            $.plot($("#team-ranking"), [ data ],
                {
                    bars: {
                        show: true
                    },
                    xaxis: {
                        minTickSize: 1
                    },
                    yaxis: {
                    },
                    grid: {
                        hoverable: true
                    }
                }
            );
            $("#team-ranking").bind("plothover", function (event, pos, item) {
                // axis coordinates for other axes, if present, are in pos.x2, pos.x3, ...
                // if you need global screen coordinates, they are pos.pageX, pos.pageY

                if (item) {
                    highlight(item.series, item.datapoint);
                    console.log("You highlighted a point!");
                }
            });
        },

        createTeamStatsGraph: function () {
        },

        createIndividualStatsGraph: function () {
            var data = [];
            this.activityLogCollection.each(function (activityLogModel) {
                var itemData = [];
                _.each(activityLogModel.get('activityData'), function (activityLogItem) {
                    var itemArray = [(new Date(activityLogItem.date)).getTime(), activityLogItem.steps];
                    itemData.push(itemArray);
                });
                console.log(JSON.stringify());
                data.push({ label: activityLogModel.get('user').displayName, data: itemData});
            });
            console.log('DATA: ' + JSON.stringify(data));
            var plotOptions = {
                xaxis: {
                    mode: 'time',
                    timeformat: '%m/%d',
                    minTickSize: [1, 'day']
                },
                yaxis: {
                    min: 0
                },
                valueLabels: {
                    show: true
                }
            };
            $.plot($("#individual-stats"), data, plotOptions);
        }
    });

    return UserView;
});