package com.avocado.android.ui.record;

import com.avocado.android.data.model.Farm;
import com.avocado.android.data.model.FarmBlock;

import java.util.ArrayList;
import java.util.List;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

public class RecordsViewModel extends ViewModel {

    private final MutableLiveData<List<Farm>> farmList;
    private final MutableLiveData<List<FarmBlock>> farmBlockList;
    private final MutableLiveData<Integer> position;
    private final MutableLiveData<String> blockId;
    private final MutableLiveData<String> variety;
    private final MutableLiveData<String> wereAnyTrapsInstalled;
    private final MutableLiveData<String> typeOfTrap;
    private final MutableLiveData<String> numberOfTraps;
    private final MutableLiveData<String> trapsReplaced;
    private final MutableLiveData<String> wereAnyPestsObserved;
    private final MutableLiveData<List<String>> pestsObserved;
    private final MutableLiveData<List<String>> beneficialInsectsObserved;
    private final MutableLiveData<String> numberOfTreesAffected;
    private final MutableLiveData<String> pestPlantPartAffected;
    private final MutableLiveData<String> pestCropStage;
    private final MutableLiveData<String> pestDetectionMethod;
    private final MutableLiveData<String> pestsPerTrap;
    private final MutableLiveData<String> wereAnyDiseasesObserved;
    private final MutableLiveData<List<String>> diseasesObserved;
    private final MutableLiveData<String> diseasePlantPartAffected;
    private final MutableLiveData<String> diseaseCropStage;
    private final MutableLiveData<String> diseaseDetectionMethod;
    private final MutableLiveData<String> actionStatus;
    private final MutableLiveData<List<String>> actionsTaken;
    private final MutableLiveData<List<String>> outcome;
    private final MutableLiveData<String> remarks;

    public RecordsViewModel() {
        farmList = new MutableLiveData<>(new ArrayList<>());
        farmBlockList = new MutableLiveData<>(new ArrayList<>());
        position = new MutableLiveData<>(-1);
        blockId = new MutableLiveData<>("");
        variety = new MutableLiveData<>("");
        wereAnyTrapsInstalled = new MutableLiveData<>("");
        typeOfTrap = new MutableLiveData<>("");
        numberOfTraps = new MutableLiveData<>("");
        trapsReplaced = new MutableLiveData<>("");
        wereAnyPestsObserved = new MutableLiveData<>("");
        pestsObserved = new MutableLiveData<>(new ArrayList<>());
        beneficialInsectsObserved = new MutableLiveData<>(new ArrayList<>());
        numberOfTreesAffected = new MutableLiveData<>("");
        pestPlantPartAffected = new MutableLiveData<>("");
        pestCropStage = new MutableLiveData<>("");
        pestDetectionMethod = new MutableLiveData<>("");
        pestsPerTrap = new MutableLiveData<>("");
        wereAnyDiseasesObserved = new MutableLiveData<>("");
        diseasesObserved = new MutableLiveData<>(new ArrayList<>());
        diseasePlantPartAffected = new MutableLiveData<>("");
        diseaseCropStage = new MutableLiveData<>("");
        diseaseDetectionMethod = new MutableLiveData<>("");
        actionStatus = new MutableLiveData<>("");
        actionsTaken = new MutableLiveData<>(new ArrayList<>());
        outcome = new MutableLiveData<>(new ArrayList<>());
        remarks = new MutableLiveData<>("");
    }

    public MutableLiveData<List<Farm>> getFarmList() {
        return farmList;
    }

    public void setFarmList(List<Farm> farmList) {
        this.farmList.setValue(farmList);
    }

    public LiveData<List<FarmBlock>> getFarmBlockList() {
        return farmBlockList;
    }

    public void setFarmBlockList(List<FarmBlock> farmBlockList) {
        this.farmBlockList.setValue(farmBlockList);
    }

    public LiveData<Integer> getPosition() {
        return position;
    }

    public void setPosition(int position) {
        this.position.setValue(position);
    }

    public LiveData<String> getWereAnyTrapsInstalled() {
        return wereAnyTrapsInstalled;
    }

    public void setWereAnyTrapsInstalled(String wereAnyTrapsInstalled) {
        this.wereAnyTrapsInstalled.setValue(wereAnyTrapsInstalled);
    }

    public LiveData<String> getWereAnyPestsObserved() {
        return wereAnyPestsObserved;
    }

    public void setWereAnyPestsObserved(String wereAnyPestsObserved) {
        this.wereAnyPestsObserved.setValue(wereAnyPestsObserved);
    }

    public LiveData<String> getWereAnyDiseasesObserved() {
        return wereAnyDiseasesObserved;
    }

    public void setWereAnyDiseasesObserved(String wereAnyDiseasesObserved) {
        this.wereAnyDiseasesObserved.setValue(wereAnyDiseasesObserved);
    }

    public LiveData<String> getActionStatus() {
        return actionStatus;
    }

    public void setActionStatus(String actionStatus) {
        this.actionStatus.setValue(actionStatus);
    }

    public LiveData<List<String>> getActionsTaken() {
        return actionsTaken;
    }

    public void setActionsTaken(List<String> actionsTaken) {
        this.actionsTaken.setValue(actionsTaken);
    }
}