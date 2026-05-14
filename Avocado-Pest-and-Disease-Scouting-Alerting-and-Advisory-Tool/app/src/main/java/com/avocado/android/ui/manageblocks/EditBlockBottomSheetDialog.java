package com.avocado.android.ui.manageblocks;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.avocado.android.databinding.DialogAddNewBlockBinding;
import com.avocado.android.databinding.DialogEditBlockBinding;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;

import androidx.annotation.NonNull;

public class EditBlockBottomSheetDialog extends BottomSheetDialogFragment {

    private EditBlockListener listener;
    private DialogEditBlockBinding binding;

    public EditBlockBottomSheetDialog() {}

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        binding = DialogEditBlockBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        binding.dialogEditBlockAddButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                editBlock();
            }
        });

        binding.dialogEditBlockCancelButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                dismiss();
            }
        });

        return root;
    }

    @Override
    public void onResume() {
        super.onResume();
        setBlockDetails();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    public void setListener(EditBlockListener listener) {
        this.listener = listener;
    }

    private void editBlock() {
        Bundle args = getArguments();
        if (args == null)
            return;

        String blockId = args.getString("blockId", "");
        String blockName = binding.dialogEditBlockBlockNameEditText.getText().toString();
        String numberOfTrees = binding.dialogEditBlockNumberOfTreesEditText.getText().toString();

        if (!blockName.isEmpty() || !numberOfTrees.isEmpty()) {
            listener.onEditBlock(blockId, blockName, numberOfTrees);
            clearDetails();
            dismiss();
        }
    }

    private void setBlockDetails() {
        Bundle args = getArguments();
        if (args == null)
            return;

        String blockName = args.getString("blockName", "");
        String numberOfTrees = args.getString("numberOfTrees", "");

        binding.dialogEditBlockBlockNameEditText.setText(blockName);
        binding.dialogEditBlockNumberOfTreesEditText.setText(numberOfTrees);
    }

    private void clearDetails() {
        binding.dialogEditBlockBlockNameEditText.setText("");
        binding.dialogEditBlockNumberOfTreesEditText.setText("");
    }

    public interface EditBlockListener {
        void onEditBlock(String blockId, String blockName, String numberOfTrees);
    }
}
