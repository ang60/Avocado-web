package com.avocado.android.data.model;

public class FarmBlock {

    private String id;
    private String name;
    private int numberOfTrees;
    private boolean isSelected;

    public FarmBlock() {

    }

    public FarmBlock(String id, String name, int numberOfTrees, boolean isSelected) {
        this.id = id;
        this.name = name;
        this.numberOfTrees = numberOfTrees;
        this.isSelected = isSelected;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getNumberOfTrees() {
        return numberOfTrees;
    }

    public void setNumberOfTrees(int numberOfTrees) {
        this.numberOfTrees = numberOfTrees;
    }

    public boolean isSelected() {
        return isSelected;
    }

    public void setSelected(boolean selected) {
        isSelected = selected;
    }

    @Override
    public String toString() {
        return name + " (" + numberOfTrees + " trees)";
    }
}
