package com.avocado.android.ui.main.advisory;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import com.avocado.android.databinding.DialogAdvisoryRecordActionBinding;
import com.avocado.android.databinding.DialogEditProfileBinding;
import com.avocado.android.ui.views.CheckBox;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;

import java.util.ArrayList;
import java.util.List;

import androidx.annotation.NonNull;

public class RecordActionBottomSheetDialog extends BottomSheetDialogFragment {

    private OnSaveListener onSaveListener;
    private DialogAdvisoryRecordActionBinding binding;

    public RecordActionBottomSheetDialog() {}

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        binding = DialogAdvisoryRecordActionBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        binding.dialogAdvisoryRecordActionCancelButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                dismiss();
            }
        });

        binding.dialogAdvisoryRecordActionSaveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (getArguments() == null) return;

                String advisoryId = getArguments().getString("advisory_id");
                String weeklyRecord = getArguments().getString("weekly_record");
                String farmer = getArguments().getString("farmer");
                String advisoryMessage = getArguments().getString("advisory_message");

                if (getActionTaken().isEmpty()) {
                    Toast.makeText(requireContext(), "Please select at least one action taken", Toast.LENGTH_SHORT).show();
                    return;
                }
                if (getOutcome().isEmpty()) {
                    Toast.makeText(requireContext(), "Please select at least one outcome", Toast.LENGTH_SHORT).show();
                    return;
                }

                String actionsTaken = getActionTaken().get(0);
                String outcome = getOutcome().get(0);
                String remarks = binding.dialogAdvisoryRecordActionRemarksEditText.getText().toString();

                onSaveListener.onSave(advisoryId, weeklyRecord, farmer, advisoryMessage, actionsTaken, outcome, remarks);
                clearUserDetails();
                dismiss();
            }
        });

        return root;
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    private void clearUserDetails() {
        clearActionTaken();
        clearOutcome();
        binding.dialogAdvisoryRecordActionRemarksEditText.setText("");
    }

    public void setOnSaveListener(OnSaveListener onSaveListener) {
        this.onSaveListener = onSaveListener;
    }

    private void clearActionTaken() {
        for (int i = 0; i < binding.dialogAdvisoryRecordActionActionTakenFlowLayout.getChildCount(); i++) {
            CheckBox checkBox = (CheckBox) binding.dialogAdvisoryRecordActionActionTakenFlowLayout.getChildAt(i);
            checkBox.setChecked(false);
        }
    }

    private void clearOutcome() {
        for (int i = 0; i < binding.dialogAdvisoryRecordActionOutcomeGridLayout.getChildCount(); i++) {
            CheckBox checkBox = (CheckBox) binding.dialogAdvisoryRecordActionOutcomeGridLayout.getChildAt(i);
            checkBox.setChecked(false);
        }
    }

    private List<String> getActionTaken() {
        List<String> actionTaken = new ArrayList<>();

        for (int i = 0; i < binding.dialogAdvisoryRecordActionActionTakenFlowLayout.getChildCount(); i++) {
            CheckBox checkBox = (CheckBox) binding.dialogAdvisoryRecordActionActionTakenFlowLayout.getChildAt(i);
            if (checkBox.isChecked()) {
                actionTaken.add(checkBox.getText().toString());
            }
        }

        return actionTaken;
    }

    private List<String> getOutcome() {
        List<String> outcome = new ArrayList<>();

        for (int i = 0; i < binding.dialogAdvisoryRecordActionOutcomeGridLayout.getChildCount(); i++) {
            CheckBox checkBox = (CheckBox) binding.dialogAdvisoryRecordActionOutcomeGridLayout.getChildAt(i);
            if (checkBox.isChecked()) {
                outcome.add(checkBox.getText().toString());
            }
        }

        return outcome;
    }

    public interface OnSaveListener {
        void onSave(String advisoryId, String weeklyRecord, String farmer, String advisoryMessage, String actionsTaken, String outcome, String remarks);
    }
}
