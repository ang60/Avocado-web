package com.avocado.android.ui.main;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;

import com.avocado.android.R;
import com.avocado.android.ui.report.ReportActivity;
import com.avocado.android.ui.start.StartActivity;
import com.google.android.material.bottomnavigation.BottomNavigationView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.navigation.ui.AppBarConfiguration;
import androidx.navigation.ui.NavigationUI;

import com.avocado.android.databinding.ActivityMainBinding;

public class MainActivity extends AppCompatActivity {

    private ActivityMainBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        BottomNavigationView navView = findViewById(R.id.nav_view);
        navView.getMenu().getItem(2).setEnabled(false); // Disable the camera icon
        navView.setItemIconTintList(null); // Remove tint from icons


        // Passing each menu ID as a set of Ids because each
        // menu should be considered as top level destinations.

        // Cannot work if theme has NoActionBar
        /* AppBarConfiguration appBarConfiguration = new AppBarConfiguration.Builder(
                R.id.navigation_home, R.id.navigation_advisory, R.id.navigation_records, R.id.navigation_settings)
                .build(); */

        NavController navController = Navigation.findNavController(this, R.id.nav_host_fragment_activity_main);
        NavigationUI.setupWithNavController(binding.navView, navController);

        // Cannot work if theme has NoActionBar
        /* NavigationUI.setupActionBarWithNavController(this, navController, appBarConfiguration); */

        binding.captureFab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(MainActivity.this, ReportActivity.class);
                startActivity(intent);
            }
        });
    }

}