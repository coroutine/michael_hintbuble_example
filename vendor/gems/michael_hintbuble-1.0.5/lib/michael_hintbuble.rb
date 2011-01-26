# external gems
require "action_pack"


# helpers
require File.dirname(__FILE__) + "/michael_hintbuble/helpers"


# add action view extensions
ActionView::Base.module_eval { include Coroutine::MichaelHintbuble::Helpers }