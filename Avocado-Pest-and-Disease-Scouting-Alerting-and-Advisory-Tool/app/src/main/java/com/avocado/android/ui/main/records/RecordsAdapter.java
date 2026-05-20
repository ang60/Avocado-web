package com.avocado.android.ui.main.records;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Filter;
import android.widget.Filterable;

import com.avocado.android.R;
import com.avocado.android.data.model.FarmBlock;
import com.avocado.android.data.model.Record;
import com.avocado.android.databinding.RecordsLayoutBinding;

import java.util.ArrayList;
import java.util.List;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

public class RecordsAdapter extends RecyclerView.Adapter<RecordsAdapter.ViewHolder> implements Filterable {

    public interface RecordListener {
        void onRecordClick(Record record, int position);
        void onRecordDeleteClick(Record record, int position);
        void onRecordEditClick(Record record, int position);
    }

    private List<Record> recordList;
    private List<Record> recordListFull;
    private final RecordListener recordListener;

    public RecordsAdapter(RecordListener recordListener) {
        this.recordList = new ArrayList<>();
        this.recordListFull = new ArrayList<>();
        this.recordListener = recordListener;
    }

    public void setRecordList(List<Record> recordList) {
        this.recordList = recordList;
        notifyDataSetChanged();
    }

    public void removeRecord(int position) {
        this.recordList.remove(position);
        this.recordListFull.remove(position);
        notifyDataSetChanged();
    }

    public void setRecordListFull(List<Record> recordList) {
        this.recordListFull = new ArrayList<>(recordList);
    }

    @NonNull
    @Override
    public RecordsAdapter.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        RecordsLayoutBinding binding = RecordsLayoutBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new RecordsAdapter.ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull RecordsAdapter.ViewHolder holder, int position) {
        holder.bind(position);
    }

    @Override
    public int getItemCount() {
        return recordList.size();
    }

    private Record getItem(int position) {
        return recordList.get(position);
    }

    public class ViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener {

        RecordsLayoutBinding binding;

        ViewHolder(RecordsLayoutBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }

        void bind(int position) {
            Record record = getItem(position);
            setTitle(record.getFarmName());
            setSubTitle(record.getBlockName() + " • " + record.getLocation());
            setTimestamp(record.getTimestamp());
            setDeleteVisibility(record.isPending());
            setEditVisibility(record.isPending());
            setDeleteClickListener(record);
            setEditClickListener(record);
            setClickListener(record);
        }

        private void setTitle(String title) {
            binding.recordLayoutTitleTextView.setText(title);
        }

        private void setSubTitle(String subTitle) {
            binding.recordLayoutSubTitleTextView.setText(subTitle);
        }

        private void setTimestamp(String timestamp) {
            binding.recordLayoutTimestampTextView.setText(timestamp);
        }

        private void setDeleteVisibility(boolean isVisible) {
            if (isVisible)
                binding.recordLayoutDeleteImageView.setVisibility(View.VISIBLE);
            else
                binding.recordLayoutDeleteImageView.setVisibility(View.GONE);
        }

        private void setEditVisibility(boolean isVisible) {
            if (isVisible)
                binding.recordLayoutEditImageView.setVisibility(View.VISIBLE);
            else
                binding.recordLayoutEditImageView.setVisibility(View.GONE);
        }

        private void setDeleteClickListener(Record record) {
            binding.recordLayoutDeleteImageView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    recordListener.onRecordDeleteClick(record, getAbsoluteAdapterPosition());
                }
            });
        }

        private void setEditClickListener(Record record) {
            binding.recordLayoutEditImageView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    recordListener.onRecordEditClick(record, getAbsoluteAdapterPosition());
                }
            });
        }

        private void setClickListener(Record record) {
            itemView.setTag(record);
            itemView.setOnClickListener(this);  //similar to binding.getRoot().setOnClickListener(this);
        }

        @Override
        public void onClick(View view) {
            recordListener.onRecordClick((Record) view.getTag(), getAbsoluteAdapterPosition());
        }
    }

    @Override
    public Filter getFilter() {
        return formFilter;
    }

    private final Filter formFilter = new Filter() {

        @Override
        protected FilterResults performFiltering(CharSequence constraint) {
            List<Record> filteredList = new ArrayList<>();

            if (constraint == null || constraint.length() == 0) {
                filteredList.addAll(recordListFull);
            } else {
                String filterPattern = constraint.toString().toLowerCase().trim();

                for (Record record : recordListFull) {
                    if (record.getFarmName().toLowerCase().contains(filterPattern)) {
                        filteredList.add(record);
                    }
                }
            }

            FilterResults results = new FilterResults();
            results.values = filteredList;
            return results;
        }

        @Override
        protected void publishResults(CharSequence constraint, FilterResults results) {
            recordList.clear();
            recordList.addAll((List<Record>) results.values);
            notifyDataSetChanged();
        }
    };
}
