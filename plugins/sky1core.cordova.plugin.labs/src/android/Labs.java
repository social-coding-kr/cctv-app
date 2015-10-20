package sky1core.cordova.plugin.labs;

import android.Manifest;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.LOG;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.PluginResult;


import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.content.pm.PackageManager;

import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;

import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

/**
 * Created by sky1corea on 2015-10-19.
 */
public class Labs extends CordovaPlugin {

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) 
        throws JSONException {

        callbackContext.success("응답1: " + args.getString(0));    
        //callbackContext.success("응답2: " + args.getString(0));    
        //callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, "응답3: " + args.getString(0)));
        //callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, "응답4: " + args.getString(0)));
        
        Toast.makeText(this.cordova.getActivity(),
            args.getString(0), Toast.LENGTH_LONG).show();

        return true;
    }

}
