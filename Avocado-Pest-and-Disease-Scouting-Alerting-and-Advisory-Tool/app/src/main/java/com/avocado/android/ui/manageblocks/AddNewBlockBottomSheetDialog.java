package com.avocado.android.ui.manageblocks;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.avocado.android.databinding.DialogAddNewBlockBinding;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;

import androidx.annotation.NonNull;

public class AddNewBlockBottomSheetDialog extends BottomSheetDialogFragment {

    private AddNewBlockListener listener;
    private DialogAddNewBlockBinding binding;

    public AddNewBlockBottomSheetDialog() {}

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        binding = DialogAddNewBlockBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        binding.dialogAddNewBlockAddButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                addNewBlock();
            }
        });

        binding.dialogAddNewBlockCancelButton.setOnClickListener(new View.OnClickListener() {
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

    public void setListener(AddNewBlockListener listener) {
        this.listener = listener;
    }

    private void addNewBlock() {
        String blockName = binding.dialogAddNewBlockBlockNameEditText.getText().toString();
        String numberOfTrees = binding.dialogAddNewBlockNumberOfTreesEditText.getText().toString();

        if (listener != null && !blockName.isEmpty() && !numberOfTrees.isEmpty()) {
            listener.onAddNewBlock(blockName, numberOfTrees);
            clearDetails();
            dismiss();
        }
    }

    private void clearDetails() {
        binding.dialogAddNewBlockBlockNameEditText.setText("");
        binding.dialogAddNewBlockNumberOfTreesEditText.setText("");
    }

    public interface AddNewBlockListener {
        void onAddNewBlock(String blockName, String numberOfTrees);
    }
}
