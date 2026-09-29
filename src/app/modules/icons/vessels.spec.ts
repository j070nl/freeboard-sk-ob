import { describe, expect, it } from 'vitest';
import {
  AIS_MOORED_STYLE_IDS,
  AIS_TYPE_IDS,
  AIS_UNKNOWN_TYPE_LABEL,
  aisVesselTypeGroup,
  aisVesselTypeLabel
} from './vessels';

describe('AIS vessel type presentation', () => {
  it('uses a dedicated neutral symbol for unknown targets', () => {
    expect(AIS_TYPE_IDS.default).toBe('ais_unknown');
    expect(AIS_MOORED_STYLE_IDS.default).toEqual(['#111111', '#B8B8B8']);
    expect(AIS_TYPE_IDS[30]).toBe('ais_active');
  });

  it('does not accept a label without a valid AIS type code', () => {
    expect(aisVesselTypeLabel()).toBe(AIS_UNKNOWN_TYPE_LABEL);
    expect(aisVesselTypeLabel({ id: 0, name: 'Pleasure' })).toBe(
      AIS_UNKNOWN_TYPE_LABEL
    );
    expect(aisVesselTypeLabel({ name: 'Pleasure' })).toBe(
      AIS_UNKNOWN_TYPE_LABEL
    );
    expect(aisVesselTypeLabel({ id: 100, name: 'Pleasure' })).toBe(
      AIS_UNKNOWN_TYPE_LABEL
    );
    expect(aisVesselTypeLabel({ id: 37, name: 'Pleasure' })).toBe('Pleasure');
    expect(aisVesselTypeLabel({ id: 70 })).toBe('AIS type 70');
  });

  it('groups missing types under Unspecified for filtering', () => {
    expect(aisVesselTypeGroup()).toBe(10);
    expect(aisVesselTypeGroup({ id: 0, name: 'Pleasure' })).toBe(10);
    expect(aisVesselTypeGroup({ id: 37, name: 'Pleasure' })).toBe(30);
  });
});
