import sublime
import sublime_plugin
import json
from os.path import dirname, realpath, join, splitext

try:
    # Python 2
    from node_bridge import node_bridge
except:
    from .node_bridge import node_bridge

# monkeypatch `Region` to be iterable
sublime.Region.totuple = lambda self: (self.a, self.b)
sublime.Region.__iter__ = lambda self: self.totuple().__iter__()

BIN_PATH = join(sublime.packages_path(), dirname(realpath(__file__)), 'jsfmt.js')
SETTINGS_FILE = 'jsfmt.sublime-settings'


settings = sublime.load_settings(SETTINGS_FILE)

def plugin_loaded():
    global settings
    settings = sublime.load_settings(SETTINGS_FILE)

class FormatJavascriptCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        if not self.has_selection():
            region = sublime.Region(0, self.view.size())
            originalBuffer = self.view.substr(region)
            formated = self.jsfmt(originalBuffer, self.get_scope(region))
            if formated:
                self.view.replace(edit, region, formated)
            return
        # handle selections
        for region in self.view.sel():
            if region.empty():
                continue
            originalBuffer = self.view.substr(region)
            formated = self.jsfmt(originalBuffer, self.get_scope(region))
            if formated:
                self.view.replace(edit, region, formated)

    def get_scope(self, region):
        return self.view.scope_name(region.begin()).rpartition('.')[2].strip()

    def jsfmt(self, data, scope):
        try:
            opt = json.dumps(settings.get('options'))
            optJSON = json.dumps(settings.get('options-JSON'))
            return node_bridge(data, BIN_PATH, [opt, scope, optJSON])
        except Exception as e:
            sublime.error_message('JSFMT\n%s' % e)

    def has_selection(self):
        for sel in self.view.sel():
            start, end = sel
            if start != end:
                return True
        return False



class CommandOnSave(sublime_plugin.EventListener):
  def on_pre_save(self, view):
    ext = splitext(view.file_name())[1][1:]
    if settings.get('autoformat') and ext in settings.get('extensions', ['js']):
        view.run_command("format_javascript")


class ToggleFormatJavascriptCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        if settings.get('autoformat', False):
            settings.set('autoformat', False)
        else:
            settings.set('autoformat', True)

        sublime.save_settings(SETTINGS_FILE)

    def is_checked(self):
        return settings.get('autoformat', False)
