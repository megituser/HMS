package com.saad.hms.converter;

import com.saad.hms.patient.entity.Gender;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class GenderConverter implements AttributeConverter<Gender, String> {

    @Override
    public String convertToDatabaseColumn(Gender gender) {
        return gender == null ? null : gender.name();
    }

    @Override
    public Gender convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return Gender.valueOf(dbData.trim().toUpperCase());
    }
}