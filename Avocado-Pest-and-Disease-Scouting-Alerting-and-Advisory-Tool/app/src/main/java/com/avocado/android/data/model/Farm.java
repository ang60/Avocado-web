package com.avocado.android.data.model;

public class Farm {

    private String farmId;
    private String farmName;
    private String location;
    private int numberOfBlocks;
    private int totalTrees;

    public String getFarmId() {
        return farmId;
    }

    public void setFarmId(String farmId) {
        this.farmId = farmId;
    }

    public String getFarmName() {
        return farmName;
    }

    public void setFarmName(String farmName) {
        this.farmName = farmName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public int getNumberOfBlocks() {
        return numberOfBlocks;
    }

    public void setNumberOfBlocks(int numberOfBlocks) {
        this.numberOfBlocks = numberOfBlocks;
    }

    public int getTotalTrees() {
        return totalTrees;
    }

    public void setTotalTrees(int totalTrees) {
        this.totalTrees = totalTrees;
    }

    public String toString() {
        return farmName + " - " + location + " - " + numberOfBlocks + " blocks - " + totalTrees + " trees";
    }
}
