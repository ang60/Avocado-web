package com.avocado.android.ui.main.settings.dialogs;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.avocado.android.databinding.DialogProfilePictureTakePhotoBinding;
import com.avocado.android.ui.views.RadioButton;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class TakePhotoBottomSheetDialog extends BottomSheetDialogFragment {

    OnPhotoListener onPhotoListener;

    private DialogProfilePictureTakePhotoBinding binding;

    public TakePhotoBottomSheetDialog() {}

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        binding = DialogProfilePictureTakePhotoBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        binding.dialogProfilePictureTakePhotoRadioButton.setOnCheckedChangeListener(new RadioButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(RadioButton view, boolean isChecked) {
                if (isChecked) {
                    view.setChecked(false);
                    onPhotoListener.onPickPhoto();
                }
            }
        });

        return root;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
    }

    @Override
    public void onResume() {
        super.onResume();

        if (getArguments() == null)
            return;

        String title = getArguments().getString("title");
        String subTitle = getArguments().getString("subTitle");

        binding.dialogProfilePictureTakePhotoTitleTextView.setText(title);
        binding.dialogProfilePictureTakePhotoSubTitleTextView.setText(subTitle);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    public void setOnPhotoListener(OnPhotoListener onPhotoListener) {
        this.onPhotoListener = onPhotoListener;
    }

    public interface OnPhotoListener {
        void onPickPhoto();
    }
}
