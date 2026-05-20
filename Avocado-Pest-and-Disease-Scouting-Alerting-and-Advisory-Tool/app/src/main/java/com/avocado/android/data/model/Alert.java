package com.avocado.android.data.model;

public class Alert {

    private String id;
    private String farmer;
    private String title;
    private String message;
    private boolean isRead;
    private String category;
    private String timestamp;
    private String timeAgo;

    public Alert() {}

    public Alert(String id, String farmer, String title, String message, boolean isRead, String category, String timestamp, String timeAgo) {
        this.id = id;
        this.farmer = farmer;
        this.title = title;
        this.message = message;
        this.isRead = isRead;
        this.category = category;
        this.timestamp = timestamp;
        this.timeAgo = timeAgo;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFarmer() {
        return farmer;
    }

    public void setFarmer(String farmer) {
        this.farmer = farmer;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getTimeAgo() {
        return timeAgo;
    }

    public void setTimeAgo(String timeAgo) {
        this.timeAgo = timeAgo;
    }
}
