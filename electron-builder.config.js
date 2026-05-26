/**
 * @type {import('electron-builder').Configuration}
 */
module.exports = {
  appId: 'com.williamthurston.sshclient',
  productName: 'SSH Client',
  copyright: 'Copyright © 2026 William Thurston',
  directories: {
    buildResources: 'resources',
    output: 'dist'
  },
  files: [
    'out/**/*',
    'node_modules/**/*',
    '!node_modules/.cache/**/*'
  ],
  mac: {
    category: 'public.app-category.developer-tools',
    icon: 'resources/icon.icns',
    target: [
      { target: 'dmg', arch: ['arm64', 'x64'] }
    ],
    darkModeSupport: true,
    hardenedRuntime: false,
    gatekeeperAssess: false
  },
  dmg: {
    title: 'SSH Client ${version}',
    icon: 'resources/icon.icns',
    background: 'resources/dmg-background.png',
    contents: [
      { x: 130, y: 220 },
      { x: 410, y: 220, type: 'link', path: '/Applications' }
    ],
    window: { width: 540, height: 380 }
  },
  linux: {
    target: ['AppImage'],
    category: 'Network'
  },
  publish: {
    provider: 'github',
    owner: 'williamianthurston-bit',
    repo: 'ssh-client'
  }
}
