package com.avocado.android.ui.record.dialogs;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.avocado.android.databinding.DialogPestCountBinding;
import com.avocado.android.ui.views.CheckBox;
import com.avocado.android.ui.views.CheckBoxThree;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;

import java.util.Objects;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class PestCountBottomSheetDialog extends BottomSheetDialogFragment {

    DialogPestCountBinding binding;
    OnDialogListener listener;

    public PestCountBottomSheetDialog() {}

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        binding = DialogPestCountBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        return root;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        setupListeners(view);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    private void setupListeners(View view) {
        binding.dialogPestCountCancelButton.setOnClickListener(v -> dismiss());
        binding.dialogPestCountAddButton.setOnClickListener(v -> {
            if (listener != null) {
                if (!Objects.requireNonNull(binding.dialogPestCountNumberPerTrapEditText.getText()).toString().isEmpty()) {
                    int count = Integer.parseInt(binding.dialogPestCountNumberPerTrapEditText.getText().toString());
                    listener.onAddButtonClicked(count);
                }
            }
            dismiss();
        });
    }

    public void setOnDialogListener(OnDialogListener listener) {
        this.listener = listener;
    }

    public interface OnDialogListener {
        void onAddButtonClicked(int count);
    }
}
