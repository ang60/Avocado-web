package com.avocado.android.ui.record.dialogs;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.avocado.android.databinding.DialogIDontKnowBinding;
import com.avocado.android.ui.record.callback.OnAudioListener;
import com.avocado.android.ui.record.callback.OnPhotoListener;
import com.avocado.android.ui.record.callback.OnWriteListener;
import com.avocado.android.ui.views.RadioButton;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class IdontKnowBottomSheetDialog extends BottomSheetDialogFragment {

    OnAudioListener onAudioListener;
    OnPhotoListener onPhotoListener;
    OnWriteListener onWriteListener;

    private DialogIDontKnowBinding binding;

    public IdontKnowBottomSheetDialog() {}

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        binding = DialogIDontKnowBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        binding.dialogIDontKnowTakePhotoRadioButton.setOnCheckedChangeListener(new RadioButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(RadioButton view, boolean isChecked) {
                if (isChecked) {
                    view.setChecked(false);
                    onPhotoListener.onPickPhoto();
                }
            }
        });

        binding.dialogIDontKnowVoiceNoteRadioButton.setOnCheckedChangeListener(new RadioButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(RadioButton view, boolean isChecked) {
                if (isChecked) {
                    view.setChecked(false);
                    onAudioListener.onPickAudio();
                }
            }
        });

        binding.dialogIDontKnowWriteDownRadioButton.setOnCheckedChangeListener(new RadioButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(RadioButton view, boolean isChecked) {
                if (isChecked) {
                    view.setChecked(false);
                    onWriteListener.onWriteDown();
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
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    public void setOnAudioListener(OnAudioListener onAudioListener) {
        this.onAudioListener = onAudioListener;
    }

    public void setOnPhotoListener(OnPhotoListener onPhotoListener) {
        this.onPhotoListener = onPhotoListener;
    }

    public void setOnWriteListener(OnWriteListener onWriteListener) {
        this.onWriteListener = onWriteListener;
    }
}
