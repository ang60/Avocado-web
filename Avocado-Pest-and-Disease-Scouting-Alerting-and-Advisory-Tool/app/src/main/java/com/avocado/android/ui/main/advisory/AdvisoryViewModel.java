package com.avocado.android.ui.main.advisory;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

public class AdvisoryViewModel extends ViewModel {

    private final MutableLiveData<String> mText;

    public AdvisoryViewModel() {
        mText = new MutableLiveData<>();
        mText.setValue("This is advisory fragment");
    }

    public LiveData<String> getText() {
        return mText;
    }
}