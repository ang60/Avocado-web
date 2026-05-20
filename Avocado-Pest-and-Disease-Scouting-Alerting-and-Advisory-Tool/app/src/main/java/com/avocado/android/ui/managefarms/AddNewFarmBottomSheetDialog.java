package com.avocado.android.ui.managefarms;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.avocado.android.databinding.DialogAddNewFarmBinding;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;

import androidx.annotation.NonNull;

public class AddNewFarmBottomSheetDialog extends BottomSheetDialogFragment {

    private AddNewFarmListener listener;
    private DialogAddNewFarmBinding binding;

    public AddNewFarmBottomSheetDialog() {}

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        binding = DialogAddNewFarmBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        binding.dialogAddNewFarmAddButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                addNewFarm();
            }
        });

        binding.dialogAddNewFarmCancelButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
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

    public void setListener(AddNewFarmListener listener) {
        this.listener = listener;
    }

    private void addNewFarm() {
        String farmName = binding.dialogAddNewFarmFarmNameEditText.getText().toString();
        String location = binding.dialogAddNewFarmLocationEditText.getText().toString();
        String numberOfBlocks = binding.dialogAddNewFarmNumberOfBlocksEditText.getText().toString();
        String farmSize = binding.dialogAddNewFarmFarmSizeEditText.getText().toString();

        if (!farmName.isEmpty() || !location.isEmpty() || !numberOfBlocks.isEmpty() || !farmSize.isEmpty()) {
            listener.onAddNewFarm(farmName, location, numberOfBlocks, farmSize);
            clearDetails();
            dismiss();
        }
    }

    private void clearDetails() {
        binding.dialogAddNewFarmFarmNameEditText.setText("");
        binding.dialogAddNewFarmLocationEditText.setText("");
        binding.dialogAddNewFarmNumberOfBlocksEditText.setText("");
        binding.dialogAddNewFarmFarmSizeEditText.setText("");
    }

    public interface AddNewFarmListener {
        void onAddNewFarm(String farmName, String location, String numberOfBlocks, String farmSize);
    }
}
