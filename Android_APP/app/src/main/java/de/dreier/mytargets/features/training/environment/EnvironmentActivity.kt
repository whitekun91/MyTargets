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

package de.dreier.mytargets.features.training.environment

import androidx.fragment.app.Fragment
import android.view.MenuItem
import de.dreier.mytargets.base.activities.SimpleFragmentActivityBase

class EnvironmentActivity : SimpleFragmentActivityBase() {
    override fun instantiateFragment(): Fragment {
        return EnvironmentFragment()
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                (childFragment as EnvironmentFragment).onSave()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    override fun onBackPressed() {
        (childFragment as EnvironmentFragment).onSave()
    }
}
