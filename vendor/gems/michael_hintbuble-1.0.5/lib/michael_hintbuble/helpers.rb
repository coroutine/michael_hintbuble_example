module Coroutine                #:nodoc:
  module MichaelHintbuble       #:nodoc:
    module Helpers              #:nodoc:
      
      # This method returns a javascript tag containing the hint bubble initialization logic. The first argument
      # to this method is <tt>target_id</tt>, the id of the html element to which the hint bubble is anchored.  
      # The target_id is required and should be unique (duh). Further options may be provided; those that 
      # are specific to the hint bubble are:
      #
      # * <tt>:class</tt> - the css style to assign to the outermost div container (defaults to "michael_hintbuble_bubble")
      # * <tt>:position</tt> - css-style value that specifies the hint bubble's relative position, e.g., top, bottom, right, or left (defaults to right)
      # * <tt>:event_names</tt> - an array of strings specifying the events that should trigger the display of the hint bubble
      # * <tt>:before_show</tt> - a Javascript function that will be invoked before the hint bubble is shown
      # * <tt>:after_show</tt> - a Javascript function that will be invoked after the hint bubble has been shown
      # * <tt>:before_hide</tt> - a Javascript function that will be invoked before the hint bubble is hidden
      # * <tt>:after_hide</tt> - a Javascript function that will be invoked after the hint bubble has been hidden
      # * <tt>&block</tt> - HTML markup that will be automatically converted to render's inline option
      # 
      # All remaining options are the same as the options available to ActionController::Base#render.  Please
      # see the documentation for ActionController::Base#render for further details.
      # 
      # ==== Events
      #
      # The library manages repositioning the hint bubble in response to window resizing and scrolling events automatically.
      # You do not need to specify <tt>resize</tt> or <tt>scroll</tt> in the optional event names array.
      #
      # The library defaults to trapping mouse gestures, but it is capable of trapping focus events in addition
      # to or in place of mouse events.  When specifying events, you need only reference the positive action: the
      # library can infer the corresponding action to toggle off the tooltip.
      #
      # Valid entries for the events array are any combination of the following options:
      #
      # * <tt>"focus"</tt>
      # * <tt>"mouseover"</tt>
      #
      #
      # ==== Example
      # 
      # # Generates: 
      # #
      # # <script type="text/javascript">
      # #   //<![CDATA[
      # #     MichaelHintbuble.Bubble.instances["foo_target_id"] = new MichaelHintbuble.Bubble("What up, foo?", { "event_names": ["mouseover"], "position": "top center" });
      # #   //]]>
      # # </script>
      # <%= render_bubble :foo_target_id, :content => "What up, foo?", :position => "top center" %>
      #   
      # In this case, a simple hint bubble is produced with the specified text content.  The bubble responds to mouseover/mouseout
      # events and centers itself above the target element when shown.
      # 
      #
      # ==== Example
      # 
      # # Generates: 
      # #
      # # <script type="text/javascript">
      # #   //<![CDATA[
      # #     MichaelHintbuble.Bubble.instances["bar_target_id"] = new MichaelHintbuble.Bubble("<ul><li>Item 1</li><li>Item 2</li></ul>", { "event_names": ["focus"], "position": "center left" });
      # #   //]]>
      # # </script>
      # <%= render_bubble :bar_target_id, :event_names => ["focus"], :position => "center left" %>
      #   <ul>
      #     <li>Item 1</li>
      #     <li>Item 2</li>
      #   </ul>
      # <% end %>
      #   
      # In this case, a slightly more complex hint bubble is produced with the specified markup.  The bubble responds to focus/blur
      # events and positions itself to the left of the target.
      #
      def render_bubble(target_id, options = {}, &block)
        options[:inline]    = capture(&block) if block_given?
        render_options      = extract_bubble_render_options(options)
        javascript_options  = bubble_options_to_js(extract_bubble_javascript_options(options))
        
        content = escape_javascript(render(render_options))
        
        raise "You gotta specify a target id to register a hint bubble, baby."  unless target_id
        raise "You gotta provide content to register a hint bubble, baby."      unless content
        
        javascript_tag "Event.observe(window, 'load', function() { MichaelHintbuble.Bubble.instances['#{target_id}'] = new MichaelHintbuble.Bubble('#{target_id}', '#{content}', #{javascript_options}) });"
      end
            
            
      # This method returns a Javascript string that will show the bubble attached to the supplied
      # target id.
      #
      def show_bubble(target_id)
        "MichaelHintbuble.Bubble.show('#{target_id}');"
      end
      
      
      # This method returns a Javascript string that will hide the bubble attached to the supplied
      # target id.
      #
      def hide_bubble(target_id)
        "MichaelHintbuble.Bubble.hide('#{target_id}');"
      end
      
      
      
      private
      
      # This method returns an array of javascript option keys supported by the accompanying
      # javascript library.
      #
      def bubble_javascript_option_keys
        [:class, :position, :event_names, :before_show, :after_show, :before_hide, :after_hide]
      end
      
      
      # This method converts ruby hashes using underscore notation to js strings using camelcase 
      # notation, which is more common in javascript.
      #
      def bubble_options_to_js(options={})
        js_kv_pairs = []
        sorted_keys = options.keys.map { |k| k.to_s }.sort.map { |s| s.to_sym }
          
        sorted_keys.each do |key|
          js_key   = key.to_s.camelcase(:lower)
          js_value = "null" 
          
          options[key] = options[key].to_s unless options[key].respond_to?(:empty?)
          
          unless options[key].empty?
            case key
              when :before_show, :after_show, :before_hide, :after_hide
                js_value = "#{options[key]}" 
              when :event_names
                js_value = "['" + options[key].join("','") + "']"
              else
                js_value = "'#{options[key]}'" 
            end
          end
          
          js_kv_pairs << "'#{js_key}':#{js_value}"
        end
        
        "{#{js_kv_pairs.join(',')}}"
      end
      
      
      # This method returns a hash with javascript options. It also inspects the supplied options 
      # and adds defaults as necessary.
      #
      def extract_bubble_javascript_options(options)
        js_options = options.reject { |k,v| !bubble_javascript_option_keys.include?(k) }
        
        js_options[:position]     = "right"                     if js_options[:position].blank?
        
        js_options[:event_names]  = []                          if js_options[:event_names].blank?
        js_options[:event_names]  = js_options[:event_names].uniq.map { |en| en.to_s }
        js_options[:event_names] << "mouseover"                 if js_options[:event_names].empty?
        
        js_options
      end
      
      
      # This method returns a hash with rendering options. It also inspects the supplied options 
      # and adds defaults as necessary.
      #
      def extract_bubble_render_options(options)
        options.reject { |k,v| bubble_javascript_option_keys.include?(k) }
      end
      
    end
  end
end
