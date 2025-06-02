#include <napi.h>
#include <libssh/libssh.h>
#include <string>
#include <vector>
#include <memory>

class SSHManager {
private:
    ssh_session session;
    bool connected;

public:
    SSHManager() : connected(false) {
        session = ssh_new();
    }

    ~SSHManager() {
        if (connected) {
            ssh_disconnect(session);
        }
        ssh_free(session);
    }

    bool connect(const std::string& host, int port, const std::string& username, const std::string& privateKeyPath) {
        ssh_options_set(session, SSH_OPTIONS_HOST, host.c_str());
        ssh_options_set(session, SSH_OPTIONS_PORT, &port);
        ssh_options_set(session, SSH_OPTIONS_USER, username.c_str());

        if (ssh_connect(session) != SSH_OK) {
            return false;
        }

        if (ssh_userauth_publickey_auto(session, nullptr, privateKeyPath.c_str()) != SSH_AUTH_SUCCESS) {
            ssh_disconnect(session);
            return false;
        }

        connected = true;
        return true;
    }

    std::string executeCommand(const std::string& command) {
        if (!connected) {
            return "Not connected";
        }

        ssh_channel channel = ssh_channel_new(session);
        if (channel == nullptr) {
            return "Failed to create channel";
        }

        if (ssh_channel_open_session(channel) != SSH_OK) {
            ssh_channel_free(channel);
            return "Failed to open session";
        }

        if (ssh_channel_request_exec(channel, command.c_str()) != SSH_OK) {
            ssh_channel_close(channel);
            ssh_channel_free(channel);
            return "Failed to execute command";
        }

        char buffer[1024];
        std::string output;
        int nbytes;

        while ((nbytes = ssh_channel_read(channel, buffer, sizeof(buffer), 0)) > 0) {
            output.append(buffer, nbytes);
        }

        ssh_channel_close(channel);
        ssh_channel_free(channel);
        return output;
    }
};

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("SSHManager", Napi::Function::New(env, [](const Napi::CallbackInfo& info) {
        Napi::Env env = info.Env();
        return Napi::External<SSHManager>::New(env, new SSHManager());
    }));

    return exports;
}

NODE_API_MODULE(ssh_manager, Init) 