package ut.hvqzao.jgantt;

import org.junit.Test;
import hvqzao.jgantt.api.MyPluginComponent;
import hvqzao.jgantt.impl.MyPluginComponentImpl;

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