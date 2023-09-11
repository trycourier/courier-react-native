package com.courierreactnative

import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.view.View
import android.widget.FrameLayout
import androidx.recyclerview.widget.DividerItemDecoration
import com.courier.android.Courier
import com.courier.android.inbox.CourierInbox
import com.courier.android.inbox.CourierInboxButtonStyles
import com.courier.android.inbox.CourierInboxFont
import com.courier.android.inbox.CourierInboxTheme
import com.courier.android.models.markAsRead
import com.courier.android.models.markAsUnread
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import java.io.IOException

class CourierReactNativeViewManager : SimpleViewManager<FrameLayout>() {

  override fun getName() = "CourierReactNativeView"

  override fun createViewInstance(reactContext: ThemedReactContext): FrameLayout {
    return FrameLayout(reactContext)
  }

  @ReactProp(name = "theme")
  fun setTheme(view: FrameLayout, theme: ReadableMap) {

    // Remove the other views if needed
    view.removeAllViews()

    // Create the view
    val courierInbox = CourierInbox(view.context)

    // Set the layout params
    val layoutParams = FrameLayout.LayoutParams(
      FrameLayout.LayoutParams.MATCH_PARENT,
      FrameLayout.LayoutParams.MATCH_PARENT
    )
    courierInbox.layoutParams = layoutParams

    // Create the inbox
    courierInbox.apply {

      // Set the themes
      theme.getMap("light")?.toTheme(view)?.let {
        lightTheme = it
      }

      theme.getMap("dark")?.toTheme(view)?.let {
        darkTheme = it
      }

      setOnClickMessageListener { message, index ->
        Courier.log(message.toString())
        if (message.isRead) message.markAsUnread() else message.markAsRead()
      }

      setOnClickActionListener { action, message, index ->
        Courier.log(action.toString())
      }

      setOnScrollInboxListener { offsetInDp ->
        Courier.log(offsetInDp.toString())
      }

    }

    // Add the view to the parent
    view.addView(courierInbox)

  }

  private fun ReadableMap.toTheme(view: View): CourierInboxTheme {

    val android = getMap("android")
    val dividerItemDecoration = android?.getString("dividerItemDecoration")

    val unreadIndicatorBarColor = getString("unreadIndicatorBarColor")
    val loadingIndicatorColor = getString("loadingIndicatorColor")

    val titleFont = getMap("titleFont")
    val timeFont = getMap("timeFont")
    val bodyFont = getMap("bodyFont")
    val detailTitleFont = getMap("detailTitleFont")
    val buttonStyles = getMap("buttonStyles")

    val context = view.context

    return CourierInboxTheme(
      dividerItemDecoration = dividerItemDecoration?.toDivider(context),
      unreadIndicatorBarColor = unreadIndicatorBarColor?.toColor(),
      loadingIndicatorColor = loadingIndicatorColor?.toColor(),
      titleFont = titleFont?.toFont(context) ?: CourierInboxFont(),
      timeFont = timeFont?.toFont(context) ?: CourierInboxFont(),
      bodyFont = bodyFont?.toFont(context) ?: CourierInboxFont(),
      detailTitleFont = detailTitleFont?.toFont(context) ?: CourierInboxFont(),
      buttonStyles = buttonStyles?.toButtonStyles(context) ?: CourierInboxButtonStyles()
    )

  }

  private fun String.toColor(): Int = Color.parseColor(this)

  private fun String.toFont(context: Context): Typeface? {
    return try {
      val assetManager = context.assets
      Typeface.createFromAsset(assetManager, this)
    } catch (e: Exception) {
      e.printStackTrace()
      null
    }
  }

  private fun String.toDivider(context: Context): DividerItemDecoration? = if (this == "vertical") DividerItemDecoration(context, DividerItemDecoration.VERTICAL) else null

  private fun ReadableMap.toFont(context: Context): CourierInboxFont {

    val typeface = getString("family")
    val size = if (isNull("size")) null else getDouble("size")
    val color = getString("color")

    return CourierInboxFont(
        typeface = typeface?.toFont(context),
        color = color?.toColor(),
        sizeInSp = size?.toInt()
      )

  }

  private fun ReadableMap.toButtonStyles(context: Context): CourierInboxButtonStyles {

    val font = getMap("font")
    val backgroundColor = getString("backgroundColor")
    val cornerRadius = if (isNull("cornerRadius")) null else getDouble("cornerRadius")

    return CourierInboxButtonStyles(
      font = font?.toFont(context),
      backgroundColor = backgroundColor?.toColor(),
      cornerRadiusInDp = cornerRadius?.toInt()
    )

  }

}
