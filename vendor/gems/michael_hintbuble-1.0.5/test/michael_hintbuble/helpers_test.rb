#---------------------------------------------------------
# Requirements
#---------------------------------------------------------

# all generic stuff required by test helper
require "test/test_helper"



#---------------------------------------------------------
# Class Definitions
#---------------------------------------------------------

class TestView < ActionView::Base
end



#---------------------------------------------------------
# Tests
#---------------------------------------------------------

class MichaelHintbubleHelpersTest < ActionView::TestCase
  
  def setup
    @view = TestView.new
  end
  
  
  def test_composition
    assert @view.respond_to?(:render_bubble,                      false)
    assert @view.respond_to?(:show_bubble,                        false)
    assert @view.respond_to?(:hide_bubble,                        false)
    assert @view.respond_to?(:bubble_javascript_option_keys,      true)
    assert @view.respond_to?(:bubble_options_to_js,               true)
    assert @view.respond_to?(:extract_bubble_javascript_options,  true)
    assert @view.respond_to?(:extract_bubble_render_options,      true)
  end
  
  
  #---------------------------------------------------------
  # Public methods
  #---------------------------------------------------------

  def test_render_bubble_with_simple_options
    text            = "Who wants to play volleyball on a court with a four-foot net?"
    default_options = "{class:'michael_hintbuble_bubble',eventNames:['mouseover','resize','scroll'],position:'right'}" 
    
    expected  = "<script type=\"text/javascript\">\n" \
                "//<![CDATA[\n" \
                "Event.observe(window, 'load', function() { MichaelHintbuble.Bubble.instances['come_fly_with_me'] = new MichaelHintbuble.Bubble('come_fly_with_me', '#{text}', #{default_options}) });\n" \
                "//]]>\n" \
                "</script>"
    actual    = @view.render_bubble(:come_fly_with_me, :text => text)
      
    assert_equal expected, actual
  end
  
  
  def test_show_bubble
    expected  = "MichaelHintbuble.Bubble.show('come_fly_with_me');"
    actual    = @view.show_bubble(:come_fly_with_me)
    
    assert_equal expected, actual
  end
  
  
  def test_hide_dialog
    expected  = "MichaelHintbuble.Bubble.hide('come_fly_with_me');"
    actual    = @view.hide_bubble(:come_fly_with_me)
    
    assert_equal expected, actual
  end
  
  
  
  #---------------------------------------------------------
  # Public methods
  #---------------------------------------------------------

  def test_bubble_javascript_option_keys
    expected  = [:class, :style, :position, :event_names, :before_show, :after_show, :before_hide, :after_hide]
    actual    = @view.send(:bubble_javascript_option_keys)

    assert_equal expected, actual
  end
  
  
  def test_bubble_options_to_js
    options = { 
                :class        => "error_container",
                :position     => "top",
                :event_names  => ["mouseover","resize","scroll"],
                :before_show  => "function{ alert('hello, world!'); }", 
                :after_show   => "function{ alert('goodbye, world!'); }"
              }
    
    expected  = "{"                                               + 
                "afterShow:function{ alert('goodbye, world!'); }" + "," +
                "beforeShow:function{ alert('hello, world!'); }"  + "," +
                "class:'error_container'"                         + "," +
                "eventNames:['mouseover','resize','scroll']"      + "," +
                "position:'top'"                                  + 
                "}"
    actual    = @view.send(:bubble_options_to_js, options)

    assert_equal expected, actual
  end
  
  
  def test_extract_bubble_javascript_options
    options     = { :class => "my_class", :event_names => ["focus", "resize", "scroll"], :position => "right", :text => "Text" }
    js_options  = @view.send(:extract_bubble_javascript_options, options)
    
    assert_equal  true,   js_options.has_key?(:class)
    assert_equal  true,   js_options.has_key?(:event_names)
    assert_equal  true,   js_options.has_key?(:position)
    assert_equal  false,  js_options.has_key?(:text)
    
    assert_equal  "my_class",                     js_options[:class]
    assert_equal  ["focus", "resize", "scroll"],  js_options[:event_names]
    assert_equal  "right",                        js_options[:position]
  end
  def test_extract_bubble_javascript_options_for_default_class
    options     = { :event_names => ["focus", "resize", "scroll"], :position => "top right", :text => "Text" }
    js_options  = @view.send(:extract_bubble_javascript_options, options)
    
    assert_equal  "michael_hintbuble_bubble",  js_options[:class]
  end
  def test_extract_bubble_javascript_options_for_default_event_names
    options     = { :class => "my_class", :position => "top right", :text => "Text" }
    js_options  = @view.send(:extract_bubble_javascript_options, options)
    
    assert_equal  ["mouseover", "resize", "scroll"],  js_options[:event_names]
  end
  def test_extract_bubble_javascript_options_for_default_position
    options     = { :class => "my_class", :event_names => ["focus", "resize", "scroll"], :text => "Text" }
    js_options  = @view.send(:extract_bubble_javascript_options, options)
    
    assert_equal  "right",  js_options[:position]
  end
  
  
  def test_extract_bubble_render_options
    options         = { :class => :my_class, :event_names => [:focus, :resize, :scroll], :position => "top right", :text => "Text" }
    render_options  = @view.send(:extract_bubble_render_options, options)
    
    assert_equal  false,  render_options.has_key?(:class)
    assert_equal  false,  render_options.has_key?(:event_names)
    assert_equal  false,  render_options.has_key?(:position)
    assert_equal  true,   render_options.has_key?(:text)
    
    assert_equal  "Text", render_options[:text]
  end
  
end