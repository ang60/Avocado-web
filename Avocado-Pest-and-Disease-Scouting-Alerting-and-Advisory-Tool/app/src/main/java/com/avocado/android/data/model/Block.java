package com.avocado.android.data.model;

public class Block {

    private String blockId;
    private String farmName;
    private String blockName;
    private String numberOfTrees;
    private String location;

    public String getBlockId() {
        return blockId;
    }

    public void setBlockId(String blockId) {
        this.blockId = blockId;
    }

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

    public String getNumberOfTrees() {
        return numberOfTrees;
    }

    public void setNumberOfTrees(String numberOfTrees) {
        this.numberOfTrees = numberOfTrees;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
