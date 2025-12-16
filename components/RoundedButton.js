/* -------------------- Imports -------------------- */
import { TouchableOpacity, Text } from 'react-native';

/* -------------------- Rounded Button Component -------------------- */
export default function RoundedButton({ title, onPress, style, textStyle }) {
  return (
    <TouchableOpacity
    activeOpacity={0.85}
      style={[{
        backgroundColor: '#6200EE',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
      }, style]}
      onPress={onPress} >
      <Text style={[{
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
      }, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}