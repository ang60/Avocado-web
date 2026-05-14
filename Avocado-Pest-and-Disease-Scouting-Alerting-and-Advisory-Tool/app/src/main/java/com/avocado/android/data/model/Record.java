package com.avocado.android.data.model;

public class Record {

    private String farmName;
    private String blockName;
    private String location;
    private String timestamp;

    public Record() {}

    public Record(String farmName, String blockName, String location, String timestamp) {
        this.farmName = farmName;
        this.blockName = blockName;
        this.location = location;
        this.timestamp = timestamp;
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
}
