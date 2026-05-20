package com.avocado.android.ui.managefarms;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.avocado.android.databinding.DialogAddNewFarmBinding;
import com.avocado.android.databinding.DialogEditFarmBinding;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;

import androidx.annotation.NonNull;

public class EditFarmBottomSheetDialog extends BottomSheetDialogFragment {

    private EditFarmListener listener;
    private DialogEditFarmBinding binding;

    public EditFarmBottomSheetDialog() {}

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        binding = DialogEditFarmBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        binding.dialogEditFarmAddButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                editFarm();
            }
        });

        binding.dialogEditFarmCancelButton.setOnClickListener(new View.OnClickListener() {
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
        setFarmDetails();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    private void setFarmDetails() {
        Bundle args = getArguments();
        if (args == null)
            return;

        String farmName = args.getString("farmName", "");
        String location = args.getString("location", "");
        String numberOfBlocks = args.getString("numberOfBlocks", "");
        String farmSize = args.getString("farmSize", "");

        Log.d("setFarmDetails", "farmName: " + farmName);

        binding.dialogEditFarmFarmNameEditText.setText(farmName);
        binding.dialogEditFarmLocationEditText.setText(location);
        binding.dialogEditFarmNumberOfBlocksEditText.setText(numberOfBlocks);
        binding.dialogEditFarmFarmSizeEditText.setText(farmSize);
    }

    private void clearDetails() {
        binding.dialogEditFarmFarmNameEditText.setText("");
        binding.dialogEditFarmLocationEditText.setText("");
        binding.dialogEditFarmNumberOfBlocksEditText.setText("");
        binding.dialogEditFarmFarmSizeEditText.setText("");
    }

    public void setListener(EditFarmListener listener) {
        this.listener = listener;
    }

    private void editFarm() {
        Bundle args = getArguments();
        if (args == null)
            return;

        String farmId = args.getString("farmId", "");
        String farmName = binding.dialogEditFarmFarmNameEditText.getText().toString();
        String location = binding.dialogEditFarmLocationEditText.getText().toString();
        String numberOfBlocks = binding.dialogEditFarmNumberOfBlocksEditText.getText().toString();
        String farmSize = binding.dialogEditFarmFarmSizeEditText.getText().toString();

        if (!farmId.isEmpty() || !farmName.isEmpty() || !location.isEmpty() || !numberOfBlocks.isEmpty() || !farmSize.isEmpty()) {
            listener.onEditFarm(farmId, farmName, location, numberOfBlocks, farmSize);
            clearDetails();
            dismiss();
        }
    }

    public interface EditFarmListener {
        void onEditFarm(String farmId, String farmName, String location, String numberOfBlocks, String farmSize);
    }
}
