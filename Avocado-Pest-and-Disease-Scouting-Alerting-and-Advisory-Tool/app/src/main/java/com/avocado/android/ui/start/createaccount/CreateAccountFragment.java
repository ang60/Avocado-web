package com.avocado.android.ui.start.createaccount;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Toast;

import com.avocado.android.R;
import com.avocado.android.databinding.FragmentStartCreateAccountBinding;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;

public class CreateAccountFragment extends Fragment {

    private FragmentStartCreateAccountBinding binding;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        binding = FragmentStartCreateAccountBinding.inflate(inflater, container, false);
        binding.fragmentStartCreateAccountYourLocationAutoCompleteTextView.setAdapter(new ArrayAdapter<>(requireContext(), android.R.layout.simple_dropdown_item_1line, getCounties()));
        View root = binding.getRoot();

        return root;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        setUpListeners(view);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    private ArrayList<String> getCounties() {
        ArrayList<String> counties = new ArrayList<>();
        counties.add("Mombasa");
        counties.add("Kwale");
        counties.add("Kilifi");
        counties.add("Tana River");
        counties.add("Lamu");
        counties.add("Taita/Taveta");
        counties.add("Garissa");
        counties.add("Wajir");
        counties.add("Mandera");
        counties.add("Marsabit");
        counties.add("Isiolo");
        counties.add("Meru");
        counties.add("Tharaka-Nithi");
        counties.add("Embu");
        counties.add("Kitui");
        counties.add("Machakos");
        counties.add("Makueni");
        counties.add("Nyandarua");
        counties.add("Nyeri");
        counties.add("Kirinyaga");
        counties.add("Murang'a");
        counties.add("Kiambu");
        counties.add("Turkana");
        counties.add("West Pokot");
        counties.add("Samburu");
        counties.add("Trans Nzoia");
        counties.add("Uasin Gishu");
        counties.add("Elgeyo/Marakwet");
        counties.add("Nandi");
        counties.add("Baringo");
        counties.add("Laikipia");
        counties.add("Nakuru");
        counties.add("Narok");
        counties.add("Kajiado");
        counties.add("Kericho");
        counties.add("Bomet");
        counties.add("Kakamega");
        counties.add("Vihiga");
        counties.add("Bungoma");
        counties.add("Busia");
        counties.add("Siaya");
        counties.add("Kisumu");
        counties.add("Homa Bay");
        counties.add("Migori");
        counties.add("Kisii");
        counties.add("Nyamira");
        counties.add("Nairobi City");

        return counties;
    }

    private void setUpListeners(View view) {
        binding.fragmentStartCreateAccountContinueButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String firstName = binding.fragmentStartCreateAccountFirstNameTextInputEditText.getText().toString();
                String lastName = binding.fragmentStartCreateAccountLastNameTextInputEditText.getText().toString();
                String location = binding.fragmentStartCreateAccountYourLocationAutoCompleteTextView.getText().toString();
                //String password = binding.fragmentStartCreateAccountPasswordTextInputEditText.getText().toString();
                boolean isTermsOfServiceChecked = binding.fragmentStartCreateAccountTermsOfServiceCheckBox.isChecked();

                if (firstName.isEmpty() || lastName.isEmpty()) {
                    Toast.makeText(requireContext(), "Invalid name, first name and last name cannot be empty", Toast.LENGTH_SHORT).show();
                    return;
                }

                if (location.isEmpty()) {
                    Toast.makeText(requireContext(), "Invalid location", Toast.LENGTH_SHORT).show();
                    return;
                }

                /*
                if (password.isEmpty()) {
                    Toast.makeText(requireContext(), "Invalid password", Toast.LENGTH_SHORT).show();
                    return;
                }
                */

                if (!isTermsOfServiceChecked) {
                    Toast.makeText(requireContext(), "Please accept the terms of service", Toast.LENGTH_SHORT).show();
                    return;
                }

                /*
                if (!PasswordValidator.hasDigit(password)) {
                    Toast.makeText(requireContext(), "Password must contain at least one digit", Toast.LENGTH_SHORT).show();
                    return;
                }

                if (!PasswordValidator.hasUppercase(password)) {
                    Toast.makeText(requireContext(), "Password must contain at least one uppercase letter", Toast.LENGTH_SHORT).show();
                    return;
                }

                if (!PasswordValidator.hasLowercase(password)) {
                    Toast.makeText(requireContext(), "Password must contain at least one lowercase letter", Toast.LENGTH_SHORT).show();
                    return;
                }

                if (!PasswordValidator.hasSpecialChar(password)) {
                    Toast.makeText(requireContext(), "Password must contain at least one special character", Toast.LENGTH_SHORT).show();
                    return;
                }

                if (!PasswordValidator.hasMinLength(password)) {
                    Toast.makeText(requireContext(), "Password must be at least 8 characters long", Toast.LENGTH_SHORT).show();
                    return;
                }
                */

                Bundle args = new Bundle();
                args.putString("first_name", firstName);
                args.putString("last_name", lastName);
                args.putString("county", location);
                args.putString("email", "");
                // args.putString("password", password);
                Navigation.findNavController(view).navigate(R.id.action_start_navigation_create_account_to_select_role_fragment, args);
            }
        });

        binding.fragmentStartCreateAccountLoginButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Navigation.findNavController(view).navigate(R.id.action_start_navigation_create_account_to_login_fragment);
            }
        });
    }
}