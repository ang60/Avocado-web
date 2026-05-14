package com.avocado.android.ui.main.records;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

public class RecordsViewModel extends ViewModel {

    private final MutableLiveData<String> totalRecords;
    private final MutableLiveData<String> doneRecords;
    private final MutableLiveData<String> pendingRecords;

    public RecordsViewModel() {
        totalRecords = new MutableLiveData<>();
        doneRecords = new MutableLiveData<>();
        pendingRecords = new MutableLiveData<>();

        totalRecords.setValue("0");
        doneRecords.setValue("0");
        pendingRecords.setValue("0");
    }

    public LiveData<String> getTotalRecords() {
        return totalRecords;
    }

    public void setTotalRecords(String totalRecords) {
        this.totalRecords.setValue(totalRecords);
    }

    public LiveData<String> getDoneRecords() {
        return doneRecords;
    }

    public void setDoneRecords(String doneRecords) {
        this.doneRecords.setValue(doneRecords);
    }

    public LiveData<String> getPendingRecords() {
        return pendingRecords;
    }

    public void setPendingRecords(String pendingRecords) {
        this.pendingRecords.setValue(pendingRecords);
    }
}