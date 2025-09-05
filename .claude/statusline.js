#!/usr/bin/env node

// Claude Code status line script to show usage limits
const os = require('os');
const path = require('path');

function getProjectInfo() {
  const cwd = process.cwd();
  const projectName = path.basename(cwd);
  return projectName;
}

function getUsageInfo() {
  // Basic usage information
  const now = new Date();
  const timeStr = now.toLocaleTimeString('ja-JP', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return `${getProjectInfo()} | ${timeStr} | Usage limits active`;
}

console.log(getUsageInfo());