package com.avocado.android.data.model;

public class Advisory {

    private String id;
    private String weeklyRecord;
    private String farmer;
    private String advisoryMessage;
    private String actionsTaken;
    private String outcome;
    private String remarks;
    private String timestamp;
    private String actionTakenStatus;
    private String timeAgo;
    private String category;

    public Advisory() {}

    public Advisory(String id, String weeklyRecord, String farmer, String advisoryMessage, String actionsTaken, String outcome, String remarks, String timestamp, String actionTakenStatus, String timeAgo, String category) {
        this.id = id;
        this.weeklyRecord = weeklyRecord;
        this.farmer = farmer;
        this.advisoryMessage = advisoryMessage;
        this.actionsTaken = actionsTaken;
        this.outcome = outcome;
        this.remarks = remarks;
        this.timestamp = timestamp;
        this.actionTakenStatus = actionTakenStatus;
        this.timeAgo = timeAgo;
        this.category = category;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getWeeklyRecord() {
        return weeklyRecord;
    }

    public void setWeeklyRecord(String weeklyRecord) {
        this.weeklyRecord = weeklyRecord;
    }

    public String getFarmer() {
        return farmer;
    }

    public void setFarmer(String farmer) {
        this.farmer = farmer;
    }

    public String getAdvisoryMessage() {
        return advisoryMessage;
    }

    public void setAdvisoryMessage(String advisoryMessage) {
        this.advisoryMessage = advisoryMessage;
    }

    public String getActionsTaken() {
        return actionsTaken;
    }

    public void setActionsTaken(String actionsTaken) {
        this.actionsTaken = actionsTaken;
    }

    public String getOutcome() {
        return outcome;
    }

    public void setOutcome(String outcome) {
        this.outcome = outcome;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getActionTakenStatus() {
        return actionTakenStatus;
    }

    public void setActionTakenStatus(String actionTakenStatus) {
        this.actionTakenStatus = actionTakenStatus;
    }

    public String getTimeAgo() {
        return timeAgo;
    }

    public void setTimeAgo(String timeAgo) {
        this.timeAgo = timeAgo;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
