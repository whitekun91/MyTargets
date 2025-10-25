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

package de.dreier.mytargets.base.fragments

import android.annotation.SuppressLint
import android.os.Bundle
import androidx.annotation.UiThread
import androidx.annotation.WorkerThread
import androidx.fragment.app.Fragment
import androidx.loader.app.LoaderManager
import androidx.loader.content.AsyncTaskLoader
import androidx.loader.content.Loader
import de.dreier.mytargets.base.navigation.NavigationController


typealias LoaderUICallback = () -> Unit

/**
 * Generic fragment class used as base for most fragments.
 * Has Icepick build in to save state on orientation change.
 */
abstract class FragmentBase : Fragment(),
    LoaderManager.LoaderCallbacks<FragmentBase.LoaderUICallbackHelper> {

    protected lateinit var navigationController: NavigationController

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        navigationController = NavigationController(this)
        reloadData()
    }

    @SuppressLint("StaticFieldLeak")
    override fun onCreateLoader(id: Int, args: Bundle?): Loader<LoaderUICallbackHelper> {
        return object : AsyncTaskLoader<LoaderUICallbackHelper>(context!!) {
            override fun loadInBackground(): LoaderUICallbackHelper? {
                val callback = onLoad(args)
                return object : LoaderUICallbackHelper {
                    override fun applyData() {
                        callback.invoke()
                    }
                }
            }
        }
    }

    @WorkerThread
    protected open fun onLoad(args: Bundle?): LoaderUICallback {
        return { }
    }

    override fun onLoadFinished(
        loader: Loader<LoaderUICallbackHelper>,
        callback: LoaderUICallbackHelper
    ) {
        callback.applyData()
    }

    override fun onLoaderReset(loader: Loader<LoaderUICallbackHelper>) {

    }

    protected fun reloadData() {
        if (loaderManager.getLoader<Any>(LOADER_ID) != null) {
            loaderManager.destroyLoader(LOADER_ID)
        }
        loaderManager.restartLoader(LOADER_ID, null, this).forceLoad()
    }

    protected fun reloadData(args: Bundle) {
        if (loaderManager.getLoader<Any>(LOADER_ID) != null) {
            loaderManager.destroyLoader(LOADER_ID)
        }
        loaderManager.restartLoader(LOADER_ID, args, this).forceLoad()
    }

    companion object {
        private const val LOADER_ID = 0
    }

    interface LoaderUICallbackHelper {
        @UiThread
        fun applyData()
    }
}
