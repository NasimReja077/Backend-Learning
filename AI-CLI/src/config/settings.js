// Setting up the configuration for the AI CLI tool
import inquirer from 'inquirer';
import chalk from 'chalk';    
import boxen from 'boxen';
import gradient from 'gradient-string';
export const settings = {
     async configure() {
            console.clear();
               const headerGradient = gradient(['#ff7e5f', '#feb47b']);
               console.log(