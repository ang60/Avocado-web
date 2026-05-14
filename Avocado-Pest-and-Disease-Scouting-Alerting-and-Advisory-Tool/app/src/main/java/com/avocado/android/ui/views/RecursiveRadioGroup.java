package com.avocado.android.ui.views;

import android.content.Context;
import android.os.Build;
import android.util.AttributeSet;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;

import java.util.concurrent.atomic.AtomicInteger;

import androidx.annotation.IdRes;
import androidx.annotation.Nullable;

/**
 * This class is a replacement for android RadioGroup - it supports
 * child layouts which standard RadioGroup doesn't.
 */
public class RecursiveRadioGroup extends LinearLayout {

    public interface OnCheckedChangeListener {
        void onCheckedChanged(RecursiveRadioGroup group, RadioButton checkedButton, @IdRes int checkedId);
    }

    /**
     * For generating unique view IDs on API < 17 with {@link #generateViewId()}.
     */
    private static final AtomicInteger sNextGeneratedId = new AtomicInteger(1);

    private RadioButton checkedView;

    private RadioButton.OnCheckedChangeListener childOnCheckedChangeListener;

    /**
     * When this flag is true, onCheckedChangeListener discards events.
     */
    private boolean mProtectFromCheckedChange = false;

    private OnCheckedChangeListener onCheckedChangeListener;

    private PassThroughHierarchyChangeListener mPassThroughListener;

    public RecursiveRadioGroup(Context context) {
        super(context);
        setOrientation(HORIZONTAL);
        init();
    }

    public RecursiveRadioGroup(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public RecursiveRadioGroup(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private void init() {
        childOnCheckedChangeListener = new CheckedStateTracker();
        mPassThroughListener = new PassThroughHierarchyChangeListener();

        super.setOnHierarchyChangeListener(mPassThroughListener);
    }

    @Override
    public void setOnHierarchyChangeListener(OnHierarchyChangeListener listener) {
        mPassThroughListener.mOnHierarchyChangeListener = listener;
    }

    @Override
    protected void onFinishInflate() {
        super.onFinishInflate();

        // checks the appropriate radio button as requested in the XML file
        if (checkedView != null) {
            mProtectFromCheckedChange = true;
            setCheckedStateForView(checkedView, true);
            mProtectFromCheckedChange = false;
            setCheckedView(checkedView);
        }
    }

    @Override
    public void addView(View child, int index, ViewGroup.LayoutParams params) {
        parseChild(child);

        super.addView(child, index, params);
    }

    private void parseChild(final View child) {
        if (child instanceof RadioButton) {
            final RadioButton checkable = (RadioButton) child;

            if (checkable.isChecked()) {
                mProtectFromCheckedChange = true;
                if (checkedView != null) {
                    setCheckedStateForView(checkedView, false);
                }
                mProtectFromCheckedChange = false;
                setCheckedView(checkable);
            }
        } else if (child instanceof ViewGroup) {
            parseChildren((ViewGroup) child);
        }
    }

    private void parseChildren(final ViewGroup child) {
        for (int i = 0; i < child.getChildCount(); i++) {
            parseChild(child.getChildAt(i));
        }
    }

    /**
     * <p>Sets the selection to the radio button whose identifier is passed in
     * parameter. Using -1 as the selection identifier clears the selection;
     * such an operation is equivalent to invoking {@link #clearCheck()}.</p>
     *
     * @param view the radio button to select in this group
     * @see #getCheckedRadioButtonId()
     * @see #clearCheck()
     */
    public void check(RadioButton view) {
        if(checkedView != null) {
            setCheckedStateForView(checkedView, false);
        }

        if(view != null) {
            setCheckedStateForView(view, true);
        }

        setCheckedView(view);
    }

    private void setCheckedView(RadioButton view) {
        checkedView = view;

        if(onCheckedChangeListener != null) {
            onCheckedChangeListener.onCheckedChanged(this, checkedView, checkedView.getId());
        }
    }

    private void setCheckedStateForView(View checkedView, boolean checked) {
        if (checkedView != null && checkedView instanceof RadioButton) {
            ((RadioButton) checkedView).setChecked(checked);
        }
    }

    /**
     * <p>Returns the identifier of the selected radio button in this group.
     * Upon empty selection, the returned value is -1.</p>
     *
     * @return the unique id of the selected radio button in this group
     * @attr ref android.R.styleable#RadioGroup_checkedButton
     * @see #check(RadioButton)
     * @see #clearCheck()
     */
    @IdRes
    public int getCheckedRadioButtonId() {
        return checkedView.getId();
    }

    public RadioButton getCheckedRadioButton() {
        return checkedView;
    }

    public String getCheckedRadioButtonText() {
        if (checkedView == null)
            return "";
        else
            return checkedView.getText().toString();
    }

    /**
     * <p>Clears the selection. When the selection is cleared, no radio button
     * in this group is selected and {@link #getCheckedRadioButtonId()} returns
     * null.</p>
     *
     * @see #check(RadioButton)
     * @see #getCheckedRadioButtonId()
     */
    public void clearCheck() {
        check(null);
    }

    /**
     * <p>Register a callback to be invoked when the checked radio button
     * changes in this group.</p>
     *
     * @param listener the callback to call on checked state change
     */
    public void setOnCheckedChangeListener(RecursiveRadioGroup.OnCheckedChangeListener listener) {
        onCheckedChangeListener = listener;
    }

    /**
     * Generate a value suitable for use in {@link #setId(int)}.
     * This value will not collide with ID values generated at build time by aapt for R.id.
     *
     * @return a generated ID value
     */
    public static int generateViewId() {
        for (; ; ) {
            final int result = sNextGeneratedId.get();
            // aapt-generated IDs have the high byte nonzero; clamp to the range under that.
            int newValue = result + 1;
            if (newValue > 0x00FFFFFF) newValue = 1; // Roll over to 1, not 0.
            if (sNextGeneratedId.compareAndSet(result, newValue)) {
                return result;
            }
        }
    }

    private class CheckedStateTracker implements RadioButton.OnCheckedChangeListener {

        @Override
        public void onCheckedChanged(RadioButton view, boolean b) {
            if (mProtectFromCheckedChange) {
                return;
            }

            mProtectFromCheckedChange = true;
            if (checkedView != null) {
                setCheckedStateForView(checkedView, false);
            }
            mProtectFromCheckedChange = false;

            int id = view.getId();
            setCheckedView(view);
        }
    }

    private class PassThroughHierarchyChangeListener implements OnHierarchyChangeListener {

        private OnHierarchyChangeListener mOnHierarchyChangeListener;

        @Override
        public void onChildViewAdded(View parent, View child) {
            if (child instanceof RadioButton) {
                int id = child.getId();

                if (id == View.NO_ID) {
                    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.JELLY_BEAN_MR1) {
                        child.setId(generateViewId());
                    } else {
                        child.setId(View.generateViewId());
                    }
                }

                ((RadioButton) child).setOnCheckedChangeListener(childOnCheckedChangeListener);

                if (mOnHierarchyChangeListener != null) {
                    mOnHierarchyChangeListener.onChildViewAdded(parent, child);
                }
            } else if(child instanceof ViewGroup) {
                // View hierarchy seems to be constructed from the bottom up,
                // so all child views are already added. That's why we
                // manually call the listener for all children of ViewGroup.
                for(int i = 0; i < ((ViewGroup) child).getChildCount(); i++) {
                    onChildViewAdded(child, ((ViewGroup) child).getChildAt(i));
                }
            }
        }

        @Override
        public void onChildViewRemoved(View parent, View child) {
            if (child instanceof RadioButton) {
                ((RadioButton) child).setOnCheckedChangeListener(null);
            }

            if (mOnHierarchyChangeListener != null) {
                mOnHierarchyChangeListener.onChildViewRemoved(parent, child);
            }
        }
    }

}