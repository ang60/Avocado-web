package com.avocado.android.data.model;

public class Record {

    private String farmName;
    private String blockName;
    private String location;
    private String timestamp;
    private boolean isPending;
    private String filePath;

    public Record() {}

    public Record(String farmName, String blockName, String location, String timestamp, boolean isPending, String filePath) {
        this.farmName = farmName;
        this.blockName = blockName;
        this.location = location;
        this.timestamp = timestamp;
        this.isPending = isPending;
        this.filePath = filePath;
    }

    // Getters and setters for the fields

    public String getFarmName() {
        return farmName;
    }

    public void setFarmName(String farmName) {
        this.farmName = farmName;
    }

    public String getBlockName() {
        return blockName;
    }

    public void setBlockName(String blockName) {
        this.blockName = blockName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isPending() {
        return isPending;
    }

    public void setPending(boolean pending) {
        isPending = pending;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
}
