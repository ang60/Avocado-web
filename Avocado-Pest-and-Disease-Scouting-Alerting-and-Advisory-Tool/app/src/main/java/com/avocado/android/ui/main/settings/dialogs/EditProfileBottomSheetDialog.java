package com.avocado.android.ui.main.settings.dialogs;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import com.avocado.android.databinding.DialogEditProfileBinding;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;

import androidx.annotation.NonNull;

public class EditProfileBottomSheetDialog extends BottomSheetDialogFragment {

    private OnSaveListener onSaveListener;
    private DialogEditProfileBinding binding;

    public EditProfileBottomSheetDialog() {}

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        binding = DialogEditProfileBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        binding.dialogEditProfileCancelButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                dismiss();
            }
        });

        binding.dialogEditProfileSaveChangesButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String firstName = binding.dialogEditProfileFirstNameEditText.getText().toString().strip();
                String lastName = binding.dialogEditProfileLastNameEditText.getText().toString().strip();
                String location = binding.dialogEditProfileLocationEditText.getText().toString().strip();
                String phoneNumber = binding.dialogEditProfilePhoneNumberEditText.getText().toString().strip();

                if (firstName.isEmpty() || lastName.isEmpty() || location.isEmpty() || phoneNumber.isEmpty()) {
                    Toast.makeText(requireContext(), "Please fill in all fields", Toast.LENGTH_SHORT).show();
                    return;
                }

                if (phoneNumber.length() != 13) {
                    Toast.makeText(requireContext(), "Please enter a valid phone number", Toast.LENGTH_SHORT).show();
                    return;
                }

                onSaveListener.onSave(firstName, lastName, location, phoneNumber);
                clearUserDetails();
                dismiss();
            }
        });

        return root;
    }

    @Override
    public void onResume() {
        super.onResume();

        setUserDetails();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    public void setUserDetails() {
        Bundle bundle = getArguments();
        if (bundle == null)
            return;

        String firstName = bundle.getString("firstName", "");
        String lastName = bundle.getString("lastName", "");
        String location = bundle.getString("location", "");
        String phoneNumber = bundle.getString("phoneNumber", "");

        binding.dialogEditProfileFirstNameEditText.setText(firstName);
        binding.dialogEditProfileLastNameEditText.setText(lastName);
        binding.dialogEditProfileLocationEditText.setText(location);
        binding.dialogEditProfilePhoneNumberEditText.setText(phoneNumber);
    }

    private void clearUserDetails() {
        binding.dialogEditProfileFirstNameEditText.setText("");
        binding.dialogEditProfileLastNameEditText.setText("");
        binding.dialogEditProfileLocationEditText.setText("");
        binding.dialogEditProfilePhoneNumberEditText.setText("");
    }

    public void setOnSaveListener(OnSaveListener onSaveListener) {
        this.onSaveListener = onSaveListener;
    }

    public interface OnSaveListener {
        void onSave(String firstName, String lastName, String location, String phoneNumber);
    }
}
