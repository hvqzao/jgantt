package ut.hvqzao.jira-jgantt-plugin;

import org.junit.Test;
import hvqzao.jira-jgantt-plugin.api.MyPluginComponent;
import hvqzao.jira-jgantt-plugin.impl.MyPluginComponentImpl;

import static org.junit.Assert.assertEquals;

public class MyComponentUnitTest
{
    @Test
    public void testMyName()
    {
        MyPluginComponent component = new MyPluginComponentImpl(null);
        assertEquals("names do not match!", "myComponent",component.getName());
    }
}