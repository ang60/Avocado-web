package com.avocado.android.ui.record;

import com.avocado.android.data.model.Data;
import com.avocado.android.data.model.Farm;
import com.avocado.android.data.model.FarmBlock;

import java.util.ArrayList;
import java.util.List;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

public class RecordsViewModel extends ViewModel {

    private final MutableLiveData<String> selectedFarmId;
    private final MutableLiveData<String> selectedFarm;
    private final MutableLiveData<List<Farm>> farmList;
    private final MutableLiveData<List<FarmBlock>> farmBlockList;
    private final MutableLiveData<String> wereAnyTrapsInstalled;
    private final MutableLiveData<String> wereAnyPestsObserved;
    private final MutableLiveData<String> wereAnyDiseasesObserved;
    private final MutableLiveData<String> actionStatus;

    public Data data;

    public RecordsViewModel() {
        data = new Data();
        selectedFarmId = new MutableLiveData<>("");
        selectedFarm = new MutableLiveData<>("");
        farmList = new MutableLiveData<>(new ArrayList<>());
        farmBlockList = new MutableLiveData<>(new ArrayList<>());
        wereAnyTrapsInstalled = new MutableLiveData<>("");
        wereAnyPestsObserved = new MutableLiveData<>("");
        wereAnyDiseasesObserved = new MutableLiveData<>("");
        actionStatus = new MutableLiveData<>("");
    }

    public LiveData<String> getSelectedFarmId() {
        return selectedFarmId;
    }

    public void setSelectedFarmId(String selectedFarmId) {
        this.selectedFarmId.setValue(selectedFarmId);
    }

    public LiveData<String> getSelectedFarm() {
        return selectedFarm;
    }

    public void setSelectedFarm(String selectedFarm) {
        this.selectedFarm.setValue(selectedFarm);
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
}