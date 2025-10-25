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

package de.dreier.mytargets.views.selector

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.util.AttributeSet
import de.dreier.mytargets.R
import de.dreier.mytargets.app.ApplicationInstance
import de.dreier.mytargets.databinding.SelectorItemImageDetailsBinding
import de.dreier.mytargets.shared.models.db.Bow

class BowSelector @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : SelectorBase<Bow, SelectorItemImageDetailsBinding>(
    context,
    attrs,
    R.layout.selector_item_image_details,
    BOW_REQUEST_CODE
) {

    private val database = ApplicationInstance.db
    private val bowDAO = database.bowDAO()

    override fun bindView(item: Bow) {
        view.name.text = item.name
        view.image.setImageDrawable(item.thumbnail!!.roundDrawable)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (resultCode == Activity.RESULT_OK && requestCode == BOW_ADD_REQUEST_CODE) {
            setItemId(null)
        }
    }

    fun setItemId(bow: Long?) {
        var item: Bow? = null
        if (bow != null) {
            item = bowDAO.loadBowOrNull(bow)
        }
        if (item == null) {
            item = bowDAO.loadBows().firstOrNull()
        }
        setItem(item)
    }

    companion object {
        const val BOW_REQUEST_CODE = 7
        const val BOW_ADD_REQUEST_CODE = 8
    }
}
