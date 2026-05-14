package com.avocado.android.ui.record.dialogs;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.avocado.android.databinding.DialogAddProductionChallengeBinding;
import com.avocado.android.databinding.DialogPestCountBinding;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;

import java.util.Objects;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class AddOtherProductionChallengeBottomSheetDialog extends BottomSheetDialogFragment {

    DialogAddProductionChallengeBinding binding;
    OnDialogListener listener;

    public AddOtherProductionChallengeBottomSheetDialog() {}

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        binding = DialogAddProductionChallengeBinding.inflate(inflater, container, false);
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
        binding.dialogAddProductionChallengeCancelButton.setOnClickListener(v -> dismiss());
        binding.dialogAddProductionChallengeAddButton.setOnClickListener(v -> {
            if (listener != null) {
                String challenge = binding.dialogAddProductionChallengeChallengeNameEditText.getText().toString();
                listener.onAddButtonClicked(challenge);
            }
            dismiss();
        });
    }

    public void setOnDialogListener(OnDialogListener listener) {
        this.listener = listener;
    }

    public interface OnDialogListener {
        void onAddButtonClicked(String challenge);
    }
}
