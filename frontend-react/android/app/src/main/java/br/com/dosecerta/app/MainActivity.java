package br.com.dosecerta.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(DoseCertaPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
