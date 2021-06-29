<template>
    <v-card flat>
        <v-container class="about-border">
        <v-row align="center" justify="center" no-gutters>
            <v-col cols="12">
                <v-img @click="openHome" class="mx-auto hover-arrow" max-width="210px" max-height="210px" contain src="../assets/logo.png"></v-img>
                <v-card-title @click="openHome" class="text-h4 justify-center hover-arrow">{{ title }}</v-card-title>
                <v-card-subtitle class="text-subtitle-1 text-center">{{ description }}</v-card-subtitle>
                <v-spacer></v-spacer>
                <v-card-text class="pa-0 font-weight-light text-body text-center">
                    {{ copyright }}
                    <table class="pa-2 pb-0 ma-auto font-weight-regular">
                        <tr>
                            <td class="text-left">Version</td>
                            <td class="text-left">: {{ currentVersion }}</td>
                        </tr>
                        <tr>
                            <td class="text-left">Latest Version</td>
                            <td class="text-left">: <span :class="{ makeLink: this.updateAvailable, 'hover-arrow': this.updateAvailable }" @click="openUpgrade">{{ latestVersionText }}</span>
                                <v-progress-circular v-if="checkingForUpdates" size="14" width="2" indeterminate/>
                            </td>
                        </tr>
                    </table>
                </v-card-text>
                <v-card-text class="pt-2 pr-0 pb-0 font-weight-light text-right hover-arrow" @click="logBug">
                    <span>Report an issue</span>
                </v-card-text>
            </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="teal darken-2" text @click="$emit('close')">Close</v-btn>
        </v-card-actions>
        </v-container>
    </v-card>
</template>

<script>
import { checkForUpdates, getCurrentVersion } from '../js/helpers';
import { shell } from 'electron';

export default {
    data() {
        return {
            title: "KubeCtl Dashboard",
            description: "Dev Desktop Client for KubeCtl",
            copyright: "Licenced under Mozilla Public License 2.0.",
            homepage: "https://prsh9.github.io/KubeCtl-Dashboard/",
            bugReportLink: "https://github.com/prsh9/KubeCtl-Dashboard/issues",
            currentVersion: getCurrentVersion(),
            latestVersionText: "Checking...",
            latestVersionLink: "",
            updateAvailable: false,
            checkingForUpdates: false,
        }
    },
    mounted() {
        this.checkUpdate();
    },
    methods: {
        checkUpdate: function() {
            var vm = this;
            vm.checkingForUpdates = true;
            vm.updateAvailable = false;
            vm.latestVersion = "Checking..",
            
            checkForUpdates().then(res => {
                vm.checkingForUpdates = false;
                
                if (res.is_upgrade) {
                    vm.updateAvailable = true;
                    vm.latestVersionText = "New Version Available";
                    vm.latestVersionLink = res.html_url;
                } else {
                    vm.updateAvailable = false;
                    vm.latestVersionText = "Up to date"
                }
                console.log(res)
            }).catch((rej) => {
                vm.checkingForUpdates = false;
                vm.updateAvailable = false;
                vm.latestVersionText = "Error Checking for Upgrade",
                console.log(rej);
            });
        },
        openUpgrade: function() {
            if(this.updateAvailable) {
                shell.openExternal(this.latestVersionLink);
            }
            console.log("UpgradeClicked")
        },
        openHome: function() {
            shell.openExternal(this.homepage);
        },
        logBug: function() {
            shell.openExternal(this.bugReportLink);
        }
    }
};
</script>

<style>
.about-border {
    outline: 1px solid black;
    outline-offset: -5px;
}
.makeLink {
    text-decoration: underline;
    color: #2574ce;
    cursor: pointer;
}
.hover-arrow {
    cursor: pointer;
}
</style>
