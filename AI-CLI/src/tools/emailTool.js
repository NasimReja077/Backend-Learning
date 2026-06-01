// src/tools/emailTool.js
import nodemailer from 'nodemailer';
import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import { settings } from '../config/settings.js';
import { mistralService } from '../services/mistralService.js';

function createTransport() {
  const cfg = settings.getEmailConfig();
  if (!cfg.host || !cfg.user || !cfg.pass) {
    throw new Error('Email not configured. Go to ⚙️ Settings → Configure Email first.');
  }
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  });
}

export const emailTool = {
  async run() {
    console.log(boxen(chalk.bold.hex('#00ffff')('  📧  Email Tool  '), {
      padding: 1, borderColor: 'cyan', margin: { top: 1, bottom: 1 }
    }));

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '✏️   Compose & Send Email', value: 'compose' },
        { name: '🤖  AI-Assisted Email Compose', value: 'ai_compose' },
        { name: '🔙  Back', value: 'back' },
      ]
    }]);

    if (action === 'back') return;
    if (action === 'compose') await composeEmail();
    if (action === 'ai_compose') await aiComposeEmail();
  }
};

async function composeEmail() {
  const answers = await inquirer.prompt([
    { name: 'to', message: 'To (recipient email):' },
    { name: 'subject', message: 'Subject:' },
    { name: 'body', message: 'Body:', type: 'editor' },
  ]);

  await sendEmail(answers.to, answers.subject, answers.body);
}

async function aiComposeEmail() {
  console.log(chalk.gray('Describe what email you want to write. AI will draft it for you.\n'));

  const { prompt } = await inquirer.prompt([{
    name: 'prompt',
    message: 'Describe the email:',
    validate: v => v.trim().length > 0 || 'Please describe the email'
  }]);

  const spinner = ora('AI is drafting your email...').start();

  let draft;
  try {
    draft = await mistralService.oneShot(
      `Write a professional email based on this request: "${prompt}"\n\nRespond ONLY with:\nTO: (leave blank)\nSUBJECT: <subject line>\n\n<email body>`,
      'You are an expert email writer. Write clear, professional, and concise emails.'
    );
    spinner.succeed('Draft ready!');
  } catch (err) {
    spinner.fail('AI draft failed: ' + err.message);
    return;
  }

  // Parse subject from draft
  const subjectMatch = draft.match(/SUBJECT:\s*(.+)/i);
  const subject = subjectMatch ? subjectMatch[1].trim() : 'No Subject';
  const body = draft.replace(/TO:.*\n?/i, '').replace(/SUBJECT:.*\n?/i, '').trim();

  console.log('\n' + boxen(
    chalk.bold.cyan('Subject: ') + chalk.white(subject) + '\n\n' + chalk.white(body),
    { padding: 1, borderColor: 'cyan', title: 'AI Draft', titleAlignment: 'center' }
  ));

  const { to, editedSubject, editedBody, confirm } = await inquirer.prompt([
    { name: 'to', message: 'To (recipient email):' },
    { name: 'editedSubject', message: 'Subject (edit if needed):', default: subject },
    { name: 'editedBody', message: 'Body (edit if needed):', type: 'editor', default: body },
    { type: 'confirm', name: 'confirm', message: 'Send this email?', default: true },
  ]);

  if (!confirm) {
    console.log(chalk.yellow('Email cancelled.'));
    return;
  }

  await sendEmail(to, editedSubject, editedBody);
}

async function sendEmail(to, subject, body) {
  const spinner = ora('Sending email...').start();
  try {
    const transport = createTransport();
    const cfg = settings.getEmailConfig();
    await transport.sendMail({
      from: cfg.from || cfg.user,
      to,
      subject,
      text: body,
    });
    spinner.succeed(chalk.green(`✅ Email sent to ${to}`));
  } catch (err) {
    spinner.fail(chalk.red('Failed to send: ' + err.message));
  }
}