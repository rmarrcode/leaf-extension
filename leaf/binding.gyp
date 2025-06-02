{
  "targets": [{
    "target_name": "ssh_manager",
    "sources": [ "src/native/ssh_manager.cpp" ],
    "include_dirs": [
      "<!@(node -p \"require('node-addon-api').include\")",
      "/opt/homebrew/include"
    ],
    "dependencies": [
      "<!(node -p \"require('node-addon-api').gyp\")"
    ],
    "libraries": [
      "-L/opt/homebrew/lib",
      "-lssh"
    ],
    "cflags!": [ "-fno-exceptions" ],
    "cflags_cc!": [ "-fno-exceptions" ],
    "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ]
  }]
} 