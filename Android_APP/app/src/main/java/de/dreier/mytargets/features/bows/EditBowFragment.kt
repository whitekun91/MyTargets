/*
 * Copyright (C) 2018 Florian Dreier
 *
 * This file is part of MyTargets.
 *
 * MyTargets is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation.
 *
 * MyTargets is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

package de.dreier.mytargets.features.bows

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.evernote.android.state.State
import de.dreier.mytargets.R
import de.dreier.mytargets.app.ApplicationInstance
import de.dreier.mytargets.base.adapters.dynamicitem.DynamicItemAdapter
import de.dreier.mytargets.base.adapters.dynamicitem.DynamicItemHolder
import de.dreier.mytargets.base.fragments.EditWithImageFragmentBase
import de.dreier.mytargets.base.navigation.NavigationController.Companion.INTENT
import de.dreier.mytargets.base.navigation.NavigationController.Companion.ITEM
import de.dreier.mytargets.databinding.FragmentEditBowBinding
import de.dreier.mytargets.databinding.ItemSightMarkBinding
import de.dreier.mytargets.shared.models.Dimension
import de.dreier.mytargets.shared.models.EBowType
import de.dreier.mytargets.shared.models.db.Bow
import de.dreier.mytargets.shared.models.db.BowImage
import de.dreier.mytargets.shared.models.db.SightMark
import de.dreier.mytargets.utils.ToolbarUtils
import de.dreier.mytargets.views.selector.SelectorBase
import de.dreier.mytargets.views.selector.SimpleDistanceSelector

class EditBowFragment : EditWithImageFragmentBase<BowImage>(R.drawable.recurve_bow) {

    @State
    lateinit var bow: Bow

    @State
    var sightMarks: ArrayList<SightMark> = ArrayList()

    private lateinit var contentBinding: FragmentEditBowBinding
    private lateinit var adapter: SightMarksAdapter

    private val bowDAO = ApplicationInstance.db.bowDAO()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val rootView = super.onCreateView(inflater, container, savedInstanceState)

        contentBinding = FragmentEditBowBinding.inflate(inflater, binding.content, true)
        contentBinding.addButton.setOnClickListener { onAddSightSetting() }
        contentBinding.moreFields.setOnClickListener { contentBinding.showAll = true }

        val bowType = EBowType
            .valueOf(arguments!!.getString(BOW_TYPE, EBowType.RECURVE_BOW.name))

        if (savedInstanceState == null) {
            val bundle = arguments
            if (bundle != null && bundle.containsKey(BOW_ID)) {
                // Load data from database
                bow = bowDAO.loadBow(bundle.getLong(BOW_ID))
                sightMarks = ArrayList(bowDAO.loadSightMarks(bow.id).sortedBy { it.distance })
                imageFiles = bowDAO.loadBowImages(bow.id)
            } else {
                // Set to default values
                bow = Bow()
                bow.name = getString(R.string.my_bow)
                bow.type = bowType
                sightMarks.add(SightMark())
                imageFiles = emptyList()
            }
        }
        ToolbarUtils.setTitle(this, bow.name)
        contentBinding.bow = bow
        contentBinding.showAll = false

        loadImage(imageFile)
        adapter = SightMarksAdapter(this, sightMarks)
        contentBinding.sightMarks.adapter = adapter
        contentBinding.sightMarks.isNestedScrollingEnabled = false
        return rootView
    }

    override fun wrapImage(imageFile: String): List<BowImage> {
        return listOf(BowImage(fileName = imageFile))
    }

    override fun onResume() {
        super.onResume()
        contentBinding.rootView.requestFocus()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        bow = buildBow()
        super.onSaveInstanceState(outState)
    }

    private fun onAddSightSetting() {
        sightMarks.add(SightMark())
        adapter.setList(sightMarks)
        adapter.notifyItemInserted(sightMarks.size - 1)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (resultCode == Activity.RESULT_OK && requestCode == SimpleDistanceSelector.SIMPLE_DISTANCE_REQUEST_CODE && data != null) {
            val intentData = data.getBundleExtra(INTENT)
            val index = intentData.getInt(SelectorBase.INDEX)
            val parcelable = data.getParcelableExtra<Dimension>(ITEM)
            sightMarks[index].distance = parcelable
            adapter.notifyItemChanged(index)
        }
    }

    public override fun onSave() {
        super.onSave()
        buildBow()
        bowDAO.saveBow(bow, imageFiles, sightMarks)
        navigationController.finish()
    }

    private fun buildBow(): Bow {
        bow.name = contentBinding.name.text.toString()
        bow.brand = contentBinding.brand.text.toString()
        bow.size = contentBinding.size.text.toString()
        bow.braceHeight = contentBinding.braceHeight.text.toString()
        bow.tiller = contentBinding.tiller.text.toString()
        bow.limbs = contentBinding.limbs.text.toString()
        bow.sight = contentBinding.sight.text.toString()
        bow.drawWeight = contentBinding.drawWeight.text.toString()
        bow.stabilizer = contentBinding.stabilizer.text.toString()
        bow.clicker = contentBinding.clicker.text.toString()
        bow.description = contentBinding.description.text.toString()
        bow.button = contentBinding.button.text.toString()
        bow.string = contentBinding.string.text.toString()
        bow.nockingPoint = contentBinding.nockingPoint.text.toString()
        bow.letoffWeight = contentBinding.letoffWeight.text.toString()
        bow.arrowRest = contentBinding.rest.text.toString()
        bow.restHorizontalPosition = contentBinding.restHorizontalPosition.text.toString()
        bow.restVerticalPosition = contentBinding.restVerticalPosition.text.toString()
        bow.restStiffness = contentBinding.restStiffness.text.toString()
        bow.camSetting = contentBinding.cam.text.toString()
        bow.scopeMagnification = contentBinding.scopeMagnification.text.toString()
        bow.thumbnail = thumbnail
        return bow
    }

    private inner class SightSettingHolder internal constructor(view: View) :
        DynamicItemHolder<SightMark>(view) {

        private val binding = ItemSightMarkBinding.bind(view)

        init {
            binding.sightSetting.addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(
                    charSequence: CharSequence,
                    i: Int,
                    i1: Int,
                    i2: Int
                ) {

                }

                override fun onTextChanged(s: CharSequence, i: Int, i1: Int, i2: Int) {
                    item!!.value = s.toString()
                }

                override fun afterTextChanged(editable: Editable) {

                }
            })
        }

        override fun onBind(
            item: SightMark,
            position: Int,
            fragment: Fragment,
            removeListener: View.OnClickListener
        ) {
            this.item = item
            binding.distance.setOnClickListener { selectedItem, index ->
                navigationController.navigateToDistance(
                    selectedItem!!,
                    index,
                    SimpleDistanceSelector.SIMPLE_DISTANCE_REQUEST_CODE
                )
            }
            binding.distance.itemIndex = position
            binding.distance.setItem(item.distance)
            binding.sightSetting.setText(item.value)
            binding.removeSightSetting.setOnClickListener(removeListener)
        }
    }

    private inner class SightMarksAdapter internal constructor(
        fragment: Fragment,
        list: MutableList<SightMark>
    ) : DynamicItemAdapter<SightMark>(fragment, list, R.string.sight_setting_removed) {

        override fun onCreateViewHolder(
            parent: ViewGroup,
            viewType: Int
        ): DynamicItemHolder<SightMark> {
            val v = inflater.inflate(R.layout.item_sight_mark, parent, false)
            return SightSettingHolder(v)
        }
    }

    companion object {
        const val BOW_TYPE = "bow_type"
        const val BOW_ID = "bow_id"
    }
}
