## MODIFIED Requirements

### Requirement: Rendering frames the play area and colors roles distinctly

`redraw` SHALL draw a visible border around the playable area so the drop zone is
unambiguous (distinguishing it from any surrounding dead space). It SHALL draw edges
as lines — **red** for an edge involved in a crossing (when the show-crossed-edges
preference is on), ink otherwise — and vertices as blobs (or index numbers, per
the vertex-style preference) in a fixed z-order so the dragged vertex sits on top.
The colors SHALL keep the "danger" color (red) reserved for crossings. A vertex
SHALL be the theme pair's second color, and a vertex adjacent to the one being
dragged the pair's first, so the held vertex's neighbors stand against the
rest. The dragged vertex SHALL be the collection's color for a thing picked up
and the keyboard-cursor vertex the collection's cursor color; the two are never
shown together, and picking a vertex up is told by its neighbors changing
color. The hint SHALL be the collection's hint color.

#### Scenario: Crossed edges and dragged-vertex neighbors are visually distinct

- **WHEN** the player drags a vertex that has neighbors while crossings exist
- **THEN** crossed edges render red, the dragged vertex renders in the color of
  a thing picked up, and its neighbor vertices render in the pair's first color
  (not red), so neighbors are not mistaken for a crossing/error indication
