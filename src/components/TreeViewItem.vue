<template>
  <div class="tree-view-item">
    <div v-if="isObject(data)" class="tree-view-item-leaf">
      <div class="tree-view-item-node" @click.stop="toggleOpen()">
        <span :class="{opened: isOpen()}" v-if="!isRootObject(data)" class="tree-view-item-key tree-view-item-key-with-chevron">{{getKey(data)}}</span>
        <span class="tree-view-item-hint" v-show="!isOpen() && data.children.length === 1">{{data.children.length}} property</span>
        <span class="tree-view-item-hint" v-show="!isOpen() && data.children.length !== 1">{{data.children.length}} properties</span>
      </div>
      <TreeViewItem :max-depth="maxDepth" :current-depth="currentDepth+1" v-show="isOpen()" v-for="(child, index) in data.children" :key="index" :data="child"></TreeViewItem>
    </div>
    <div v-if="isArray(data)" class="tree-view-item-leaf">
      <div class="tree-view-item-node" @click.stop="toggleOpen()">
        <span :class="{opened: isOpen()}" v-if="!isRootObject(data)" class="tree-view-item-key tree-view-item-key-with-chevron">{{getKey(data)}}</span>
        <span class="tree-view-item-hint" v-show="!isOpen() && data.children.length === 1">{{data.children.length}} item</span>
        <span class="tree-view-item-hint" v-show="!isOpen() && data.children.length !== 1">{{data.children.length}} items</span>
      </div>
      <TreeViewItem :max-depth="maxDepth" :current-depth="currentDepth+1" v-show="isOpen()" v-for="(child, index) in data.children" :key="index" :data="child"></TreeViewItem>
    </div>
    <div class="tree-view-item-leaf" v-if="isValue(data)">
      <span class="tree-view-item-key"><b>{{getKey(data)}}</b></span>
      <span class="tree-view-item-value">{{getValue(data)}}</span>
    </div>
  </div>
</template>

<script>

import { capitalCase } from "capital-case";
import _ from 'lodash';

export default {
  name: "TreeViewItem",
  props: ["data", "max-depth", "current-depth"],
  data: function(){
    return {
      open: this.currentDepth < this.maxDepth
    }
  },
  methods: {
    isOpen: function(){
      return this.isRootObject(this.data) || this.open;
    },
    toggleOpen:function(){
      this.open = !this.open;
    },
    isObject: function(value){
      return value.type === 'object';
    },
    isArray: function(value){
      return value.type === 'array';
    },
    isValue: function(value){
      return value.type === 'value';
    },
    getKey: function(value){
      if (_.isInteger(value.key)) {
        return "- ";
      }
      return capitalCase(value.key) + ": ";
    },
    getValue: function(value){
      if (_.isNumber(value.value)) {
        return value.value
      }
      if (_.isNull(value.value)) {
        return "null"
      }
      if (_.isString(value.value)) {
        return value.value;
      }
    },
    isRootObject: function(value){
      return value.isRoot;
    }
  }
}
</script>

<style>

.tree-view-item {
  font-family: monospace;
  font-size: 14px;
  margin-left: 18px;
}

/* Find the first nested node and override the indentation */
.tree-view-item-root > .tree-view-item-leaf > .tree-view-item {
  margin-left: 0;
}

.tree-view-item-node {
  cursor: pointer;
  position: relative;
  white-space: nowrap;
}

.tree-view-item-leaf {
  white-space: nowrap;
}


.tree-view-item-key {
  /* font-weight: bold; */
  font-weight: bolder;
}

.tree-view-item-key-with-chevron.opened::before {
    top:4px;
    transform: rotate(90deg);
    -webkit-transform: rotate(90deg);
}

.tree-view-item-key-with-chevron::before {
    color: #444;
    font-size: 10px;
    left: 1px;
    position: absolute;
    top: 3px;
    transition: -webkit-transform .1s ease;
    transition: transform .1s ease;
    transition: transform .1s ease, -webkit-transform .1s ease;
    -webkit-transition: -webkit-transform .1s ease;
}

.tree-view-item-hint {
  color: #ccc
}
</style>