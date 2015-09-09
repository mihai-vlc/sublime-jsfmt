import os
import platform
from subprocess import Popen, PIPE
import sublime

IS_OSX = platform.system() == 'Darwin'
IS_WINDOWS = platform.system() == 'Windows'
SETTINGS_FILE = 'jsfmt.sublime-settings'


def node_bridge(data, bin, cdir, args=[]):
    settings = sublime.load_settings(SETTINGS_FILE)
    env = None
    if IS_OSX:
        # GUI apps in OS X doesn't contain .bashrc/.zshrc set paths
        env = os.environ.copy()
        env['PATH'] += ':/usr/local/bin'
    try:
        p = Popen([settings.get('node-path', 'node'), bin] + args,
                  stdout=PIPE, stdin=PIPE, stderr=PIPE,
                  cwd=cdir, env=env, shell=IS_WINDOWS)
    except OSError:
        raise Exception('''Couldn\'t find Node.js. Make sure it's in your
            $PATH by running `node -v` in your command-line.''')
    stdout, stderr = p.communicate(input=data.encode('utf-8'))
    stdout = stdout.decode('utf-8')
    stderr = stderr.decode('utf-8')
    if stderr:
        raise Exception('Error: %s' % stderr)
    else:
        return stdout
