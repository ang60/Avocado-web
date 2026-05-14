package com.avocado.android.data.model;

public class PestsObserved {

    private String name;
    private int numberPerTrap;
    private String photoTrap;

    public PestsObserved() {}

    public PestsObserved(String name, int numberPerTrap, String photoTrap) {
        this.name = name;
        this.numberPerTrap = numberPerTrap;
        this.photoTrap = photoTrap;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getNumberPerTrap() {
        return numberPerTrap;
    }

    public void setNumberPerTrap(int numberPerTrap) {
        this.numberPerTrap = numberPerTrap;
    }

    public String getPhotoTrap() {
        return photoTrap;
    }

    public void setPhotoTrap(String photoTrap) {
        this.photoTrap = photoTrap;
    }
}
