package com.avocado.android.data.model;

public class TrapUse {

    private String typeOfTrap;
    private int numberOfTraps;
    private int averageNumberOfPestsPerTrap;
    private String trapPhoto;

    public TrapUse() {}

    public TrapUse(String typeOfTrap, int numberOfTraps, int averageNumberOfPestsPerTrap, String trapPhoto) {
        this.typeOfTrap = typeOfTrap;
        this.numberOfTraps = numberOfTraps;
        this.averageNumberOfPestsPerTrap = averageNumberOfPestsPerTrap;
        this.trapPhoto = trapPhoto;
    }

    public String getTypeOfTrap() {
        return typeOfTrap;
    }

    public void setTypeOfTrap(String typeOfTrap) {
        this.typeOfTrap = typeOfTrap;
    }

    public int getNumberOfTraps() {
        return numberOfTraps;
    }

    public void setNumberOfTraps(int numberOfTraps) {
        this.numberOfTraps = numberOfTraps;
    }

    public int getAverageNumberOfPestsPerTrap() {
        return averageNumberOfPestsPerTrap;
    }

    public void setAverageNumberOfPestsPerTrap(int averageNumberOfPestsPerTrap) {
        this.averageNumberOfPestsPerTrap = averageNumberOfPestsPerTrap;
    }

    public String getTrapPhoto() {
        return trapPhoto;
    }

    public void setTrapPhoto(String trapPhoto) {
        this.trapPhoto = trapPhoto;
    }
}
